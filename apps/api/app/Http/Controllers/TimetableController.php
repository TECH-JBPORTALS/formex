<?php

namespace App\Http\Controllers;

use App\Models\Program;
use App\Models\Subject;
use App\Models\TimeTable;
use App\Models\TimeTableSlot;
use App\Models\User;
use App\Support\CurrentInstitutionSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class TimetableController
{
    private const array DAYS = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
    ];

    public function show(Request $request, Program $program): JsonResponse
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);

        /** @var Program $program */
        $program = $institution->programs()->whereKey($program->id)->firstOrFail();

        $validated = $request->validate([
            'semester' => ['required', 'integer', 'min:1', 'max:12'],
        ]);

        $timeTable = $program->time_tables()
            ->where('semester', $validated['semester'])
            ->where('academic_year', $institution->academic_year)
            ->with([
                'time_table_slots' => function ($query): void {
                    $query->orderBy('day')->orderBy('start_hour_no');
                },
                'time_table_slots.subjects.subject:id,name,short_name',
                'time_table_slots.subjects.course_coordinator:id,name',
            ])
            ->first();

        if ($timeTable === null) {
            return response()->json([
                'data' => [
                    'semester' => (int) $validated['semester'],
                    'academic_year' => (int) $institution->academic_year,
                    'slots' => [],
                ],
            ]);
        }

        return response()->json([
            'data' => [
                'id' => $timeTable->id,
                'semester' => $timeTable->semester,
                'academic_year' => $timeTable->academic_year,
                'slots' => $this->serializeSlots($timeTable->time_table_slots->all()),
            ],
        ]);
    }

    public function upsertSlot(Request $request, Program $program): JsonResponse
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);

        /** @var Program $program */
        $program = $institution->programs()->whereKey($program->id)->firstOrFail();

        $validated = $request->validate([
            'semester' => ['required', 'integer', 'min:1', 'max:12'],
            'day' => ['required', Rule::in(self::DAYS)],
            'start_hour_no' => ['required', 'integer', 'min:1', 'max:7'],
            'end_hour_no' => ['required', 'integer', 'min:1', 'max:7', 'gte:start_hour_no'],
            'subjects' => ['required', 'array', 'min:1', 'max:10'],
            'subjects.*.subject_id' => ['required', 'string'],
            'subjects.*.course_coordinator_id' => ['required', 'string'],
            'subjects.*.batch' => ['required', 'string', 'max:255'],
            'subjects.*.room_no' => ['required', 'string', 'max:255'],
        ]);

        if ($validated['start_hour_no'] <= 4 && $validated['end_hour_no'] >= 5) {
            return response()->json([
                'message' => 'Slot cannot cross lunch break.',
            ], 422);
        }

        $subjectIds = collect($validated['subjects'])->pluck('subject_id')->unique()->values();
        $coordinatorIds = collect($validated['subjects'])->pluck('course_coordinator_id')->unique()->values();

        $allowedSubjectIds = Subject::query()
            ->where('institution_id', $institution->id)
            ->where('program_id', $program->id)
            ->whereIn('id', $subjectIds)
            ->pluck('id');
        if ($allowedSubjectIds->count() !== $subjectIds->count()) {
            return response()->json([
                'message' => 'One or more subjects are invalid for this program.',
            ], 422);
        }

        $allowedCoordinatorIds = User::query()
            ->whereIn('id', $coordinatorIds)
            ->whereHas('institutions', function ($query) use ($institution): void {
                $query->where('institutions.id', $institution->id);
            })
            ->pluck('id');
        if ($allowedCoordinatorIds->count() !== $coordinatorIds->count()) {
            return response()->json([
                'message' => 'One or more coordinators are invalid for this institution.',
            ], 422);
        }

        /** @var TimeTableSlot $slot */
        $slot = DB::transaction(function () use ($institution, $program, $validated): TimeTableSlot {
            $timeTable = TimeTable::query()->firstOrCreate([
                'program_id' => $program->id,
                'semester' => $validated['semester'],
                'academic_year' => $institution->academic_year,
            ]);

            $existingSlot = TimeTableSlot::query()
                ->where('time_table_id', $timeTable->id)
                ->where('day', $validated['day'])
                ->where('start_hour_no', $validated['start_hour_no'])
                ->first();

            $overlapQuery = TimeTableSlot::query()
                ->where('time_table_id', $timeTable->id)
                ->where('day', $validated['day'])
                ->where('start_hour_no', '<=', $validated['end_hour_no'])
                ->where('end_hour_no', '>=', $validated['start_hour_no']);

            if ($existingSlot !== null) {
                $overlapQuery->whereKeyNot($existingSlot->id);
            }

            if ($overlapQuery->exists()) {
                throw ValidationException::withMessages([
                    'slot' => 'This range overlaps an existing slot.',
                ]);
            }

            $slot = TimeTableSlot::query()->updateOrCreate(
                [
                    'time_table_id' => $timeTable->id,
                    'day' => $validated['day'],
                    'start_hour_no' => $validated['start_hour_no'],
                ],
                [
                    'end_hour_no' => $validated['end_hour_no'],
                ],
            );

            $slot->subjects()->delete();

            foreach ($validated['subjects'] as $subjectData) {
                $slot->subjects()->create([
                    'subject_id' => $subjectData['subject_id'],
                    'course_coordinator_id' => $subjectData['course_coordinator_id'],
                    'batch' => $subjectData['batch'],
                    'room_no' => $subjectData['room_no'],
                ]);
            }

            return $slot;
        });

        $slot->load([
            'subjects.subject:id,name,short_name',
            'subjects.course_coordinator:id,name',
        ]);

        return response()->json([
            'message' => 'Timetable slot saved successfully.',
            'data' => $this->serializeSlot($slot),
        ]);
    }

    /**
     * @param  list<TimeTableSlot>  $slots
     * @return list<array{
     *     id:string,
     *     day:string,
     *     start_hour_no:int,
     *     end_hour_no:int,
     *     subjects:list<array{
     *         id:string,
     *         subject_id:string,
     *         subject_name:string,
     *         course_coordinator_id:string,
     *         course_coordinator_name:string,
     *         batch:string,
     *         room_no:string
     *     }>
     * }>
     */
    private function serializeSlots(array $slots): array
    {
        $dayOrder = array_flip(self::DAYS);

        return collect($slots)
            ->sortBy(fn (TimeTableSlot $slot): string => sprintf(
                '%02d-%02d',
                $dayOrder[$slot->day] ?? 99,
                $slot->start_hour_no,
            ))
            ->values()
            ->map(fn (TimeTableSlot $slot): array => $this->serializeSlot($slot))
            ->all();
    }

    /**
     * @return array{
     *     id:string,
     *     day:string,
     *     start_hour_no:int,
     *     end_hour_no:int,
     *     subjects:list<array{
     *         id:string,
     *         subject_id:string,
     *         subject_name:string,
     *         course_coordinator_id:string,
     *         course_coordinator_name:string,
     *         batch:string,
     *         room_no:string
     *     }>
     * }
     */
    private function serializeSlot(TimeTableSlot $slot): array
    {
        return [
            'id' => $slot->id,
            'day' => $slot->day,
            'start_hour_no' => $slot->start_hour_no,
            'end_hour_no' => $slot->end_hour_no,
            'subjects' => $slot->subjects->map(fn ($subject): array => [
                'id' => $subject->id,
                'subject_id' => $subject->subject_id,
                'subject_name' => $subject->subject?->name ?? '',
                'course_coordinator_id' => $subject->course_coordinator_id,
                'course_coordinator_name' => $subject->course_coordinator?->name ?? '',
                'batch' => $subject->batch,
                'room_no' => $subject->room_no,
            ])->values()->all(),
        ];
    }
}
