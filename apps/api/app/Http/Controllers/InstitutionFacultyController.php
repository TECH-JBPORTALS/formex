<?php

namespace App\Http\Controllers;

use App\Http\Resources\InstitutionFacultyResource;
use App\Models\Program;
use App\Models\Subject;
use App\Models\User;
use App\Support\CurrentInstitutionSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class InstitutionFacultyController
{
    /**
     * List coordinator faculty in the current institution.
     */
    public function index(Request $request)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);

        $members = $institution->users()
            ->wherePivotIn('role', ['program_coordinator', 'course_coordinator'])
            ->orderBy('users.name')
            ->get();

        $data = $members->map(function (User $user) use ($institution): array {
            return $this->membershipPayload($institution->id, $user->id);
        })->values();

        return InstitutionFacultyResource::collection($data);
    }

    /**
     * Assign a coordinator role to a user in the current institution.
     */
    public function store(Request $request)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);

        $validated = $request->validate([
            'user_id' => ['required', 'ulid', Rule::exists('users', 'id')],
            'role' => ['required', Rule::in(['program_coordinator', 'course_coordinator'])],
            'program_ids' => ['nullable', 'array'],
            'program_ids.*' => ['ulid'],
            'subject_ids' => ['nullable', 'array'],
            'subject_ids.*' => ['ulid'],
        ]);

        $user = User::query()->findOrFail($validated['user_id']);
        [$programIds, $subjectIds] = $this->resolveAssignments($institution->id, $validated);

        $existingMembership = $institution->users()
            ->where('users.id', $user->id)
            ->first();

        if ($existingMembership !== null && $existingMembership->pivot->role === 'principal') {
            throw ValidationException::withMessages([
                'role' => ['Principal cannot be updated from faculty management.'],
            ]);
        }

        if ($existingMembership !== null) {
            $institution->users()->updateExistingPivot($user->id, [
                'role' => $validated['role'],
            ]);
        } else {
            $institution->users()->attach($user->id, [
                'role' => $validated['role'],
            ]);
        }
        $this->syncAssignments($institution->id, $user->id, $programIds, $subjectIds);

        return InstitutionFacultyResource::make(
            $this->membershipPayload($institution->id, $user->id)
        )->response()->setStatusCode(201);
    }

    /**
     * Update an existing faculty assignment in the current institution.
     */
    public function update(Request $request, User $faculty)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);

        $membership = $institution->users()
            ->where('users.id', $faculty->id)
            ->first();

        if ($membership === null) {
            abort(404);
        }

        if ($membership->pivot->role === 'principal') {
            throw ValidationException::withMessages([
                'role' => ['Principal cannot be updated from faculty management.'],
            ]);
        }

        $validated = $request->validate([
            'role' => ['required', Rule::in(['program_coordinator', 'course_coordinator'])],
            'program_ids' => ['nullable', 'array'],
            'program_ids.*' => ['ulid'],
            'subject_ids' => ['nullable', 'array'],
            'subject_ids.*' => ['ulid'],
        ]);

        [$programIds, $subjectIds] = $this->resolveAssignments($institution->id, $validated);

        $institution->users()->updateExistingPivot($faculty->id, [
            'role' => $validated['role'],
        ]);
        $this->syncAssignments($institution->id, $faculty->id, $programIds, $subjectIds);

        return InstitutionFacultyResource::make(
            $this->membershipPayload($institution->id, $faculty->id)
        );
    }

    /**
     * Remove faculty membership from the current institution.
     */
    public function destroy(Request $request, User $faculty)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);

        $membership = $institution->users()
            ->where('users.id', $faculty->id)
            ->first();

        if ($membership === null) {
            abort(404);
        }

        if ($membership->pivot->role === 'principal') {
            throw ValidationException::withMessages([
                'role' => ['Principal cannot be removed from faculty management.'],
            ]);
        }

        $institution->users()->detach($faculty->id);
        $this->syncAssignments($institution->id, $faculty->id, [], []);

        return response()->json([
            'message' => 'Faculty removed successfully.',
        ]);
    }

    /**
     * @param  array{role: string, program_ids?: array<int, string>, subject_ids?: array<int, string>}  $validated
     * @return array{0: array<int, string>, 1: array<int, string>}
     */
    private function resolveAssignments(string $institutionId, array $validated): array
    {
        $programIds = array_values(array_unique($validated['program_ids'] ?? []));
        $subjectIds = array_values(array_unique($validated['subject_ids'] ?? []));

        if ($validated['role'] === 'program_coordinator') {
            if ($programIds === []) {
                throw ValidationException::withMessages([
                    'program_ids' => ['Program coordinator must be assigned to at least one branch (program).'],
                ]);
            }

            $validProgramIds = Program::query()
                ->where('institution_id', $institutionId)
                ->whereIn('id', $programIds)
                ->pluck('id')
                ->all();

            if (count($validProgramIds) !== count($programIds)) {
                throw ValidationException::withMessages([
                    'program_ids' => ['One or more selected programs do not belong to current institution.'],
                ]);
            }

            if ($subjectIds === []) {
                return [$programIds, []];
            }

            $subjects = Subject::query()
                ->where('institution_id', $institutionId)
                ->whereIn('id', $subjectIds)
                ->get(['id', 'program_id']);

            if ($subjects->count() !== count($subjectIds)) {
                throw ValidationException::withMessages([
                    'subject_ids' => ['One or more selected subjects do not belong to current institution.'],
                ]);
            }

            foreach ($subjects as $subject) {
                if (! in_array($subject->program_id, $programIds, true)) {
                    throw ValidationException::withMessages([
                        'subject_ids' => ['Selected subjects must belong to assigned programs for program coordinator.'],
                    ]);
                }
            }

            return [$programIds, $subjectIds];
        }

        if ($programIds !== []) {
            throw ValidationException::withMessages([
                'program_ids' => ['Course coordinator can only be assigned to subjects.'],
            ]);
        }

        if ($subjectIds === []) {
            throw ValidationException::withMessages([
                'subject_ids' => ['Course coordinator must be assigned to at least one subject.'],
            ]);
        }

        $validSubjectIds = Subject::query()
            ->where('institution_id', $institutionId)
            ->whereIn('id', $subjectIds)
            ->pluck('id')
            ->all();

        if (count($validSubjectIds) !== count($subjectIds)) {
            throw ValidationException::withMessages([
                'subject_ids' => ['One or more selected subjects do not belong to current institution.'],
            ]);
        }

        return [[], $subjectIds];
    }

    /**
     * @return array<string, mixed>
     */
    private function membershipPayload(string $institutionId, string $userId): array
    {
        $member = User::query()
            ->whereKey($userId)
            ->with([
                'institutions' => function ($query) use ($institutionId): void {
                    $query->where('institutions.id', $institutionId);
                },
            ])
            ->firstOrFail();

        $membership = $member->institutions->first();
        if ($membership === null) {
            abort(404);
        }

        $programIds = DB::table('institution_user_program')
            ->where('institution_id', $institutionId)
            ->where('user_id', $member->id)
            ->pluck('program_id')
            ->all();

        $subjectIds = DB::table('institution_user_subject')
            ->where('institution_id', $institutionId)
            ->where('user_id', $member->id)
            ->pluck('subject_id')
            ->all();

        $programs = Program::query()
            ->where('institution_id', $institutionId)
            ->whereIn('id', $programIds)
            ->orderBy('name')
            ->get()
            ->map(function (Program $program): array {
                return [
                    'id' => $program->id,
                    'name' => $program->name,
                    'short_name' => $program->short_name,
                ];
            })
            ->values()
            ->all();

        $subjects = Subject::query()
            ->where('institution_id', $institutionId)
            ->whereIn('id', $subjectIds)
            ->orderBy('name')
            ->get()
            ->map(function (Subject $subject): array {
                return [
                    'id' => $subject->id,
                    'name' => $subject->name,
                    'short_name' => $subject->short_name,
                ];
            })
            ->values()
            ->all();

        return [
            'id' => $member->id,
            'name' => $member->name,
            'email' => $member->email,
            'role' => $membership->pivot->role,
            'programs' => $programs,
            'subjects' => $subjects,
        ];
    }

    /**
     * @param  array<int, string>  $programIds
     * @param  array<int, string>  $subjectIds
     */
    private function syncAssignments(string $institutionId, string $userId, array $programIds, array $subjectIds): void
    {
        DB::transaction(function () use ($institutionId, $userId, $programIds, $subjectIds): void {
            DB::table('institution_user_program')
                ->where('institution_id', $institutionId)
                ->where('user_id', $userId)
                ->delete();

            if ($programIds !== []) {
                DB::table('institution_user_program')->insert(
                    collect($programIds)->map(function (string $programId) use ($institutionId, $userId): array {
                        return [
                            'institution_id' => $institutionId,
                            'user_id' => $userId,
                            'program_id' => $programId,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    })->all(),
                );
            }

            DB::table('institution_user_subject')
                ->where('institution_id', $institutionId)
                ->where('user_id', $userId)
                ->delete();

            if ($subjectIds !== []) {
                DB::table('institution_user_subject')->insert(
                    collect($subjectIds)->map(function (string $subjectId) use ($institutionId, $userId): array {
                        return [
                            'institution_id' => $institutionId,
                            'user_id' => $userId,
                            'subject_id' => $subjectId,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    })->all(),
                );
            }
        });
    }
}
