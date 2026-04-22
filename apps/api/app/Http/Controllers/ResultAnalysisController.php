<?php

namespace App\Http\Controllers;

use App\Http\Resources\ResultAnalysisResource;
use App\Models\ResultAnalysis;
use App\Models\Student;
use App\Models\Subject;
use App\Support\CurrentInstitutionSession;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ResultAnalysisController
{
    public function listByCourse(Request $request, Subject $subject)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $subject = $institution->subjects()->whereKey($subject->id)->firstOrFail();

        $rows = $subject
            ->result_analyses()
            ->with(['course', 'student'])
            ->latest()
            ->get();

        return ResultAnalysisResource::collection($rows);
    }

    public function store(Request $request, Subject $subject)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $subject = $institution->subjects()->whereKey($subject->id)->firstOrFail();
        $validated = $this->validatePayload($request, $subject);

        $result = ResultAnalysis::query()->create([
            'course_id' => $subject->id,
            'student_id' => $validated['student_id'],
            'scored_grade' => $validated['scored_grade'],
        ]);

        return ResultAnalysisResource::make($result->loadMissing(['course', 'student']))->response()->setStatusCode(201);
    }

    public function show(Request $request, ResultAnalysis $resultAnalysis): ResultAnalysisResource
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        abort_unless($this->belongsToInstitution($resultAnalysis, $institution->id), 404);

        return ResultAnalysisResource::make($resultAnalysis->loadMissing(['course', 'student']));
    }

    public function update(Request $request, ResultAnalysis $resultAnalysis): ResultAnalysisResource
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        abort_unless($this->belongsToInstitution($resultAnalysis, $institution->id), 404);

        $validated = $request->validate([
            'scored_grade' => ['required', 'string', Rule::in(ResultAnalysis::SCORED_GRADES)],
        ]);

        $resultAnalysis->update([
            'scored_grade' => $validated['scored_grade'],
        ]);

        return ResultAnalysisResource::make($resultAnalysis->loadMissing(['course', 'student']));
    }

    public function destroy(Request $request, ResultAnalysis $resultAnalysis): ResultAnalysisResource
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        abort_unless($this->belongsToInstitution($resultAnalysis, $institution->id), 404);

        $resultAnalysis->delete();

        return ResultAnalysisResource::make($resultAnalysis->loadMissing(['course', 'student']));
    }

    private function validatePayload(Request $request, Subject $subject): array
    {
        $validated = $request->validate([
            'student_id' => ['required', 'ulid', 'exists:students,id'],
            'scored_grade' => ['required', 'string', Rule::in(ResultAnalysis::SCORED_GRADES)],
        ]);

        $student = Student::query()->findOrFail($validated['student_id']);
        abort_unless(
            $student->institution_id === $subject->institution_id
            && $student->program_id === $subject->program_id
            && (int) $student->semester === (int) $subject->semester,
            422,
            'Student must belong to this course context (same institution, program, and semester).',
        );

        if (
            ResultAnalysis::query()
                ->where('course_id', $subject->id)
                ->where('student_id', $validated['student_id'])
                ->exists()
        ) {
            abort(422, 'Result analysis for this student in this course already exists.');
        }

        return $validated;
    }

    private function belongsToInstitution(ResultAnalysis $resultAnalysis, string $institutionId): bool
    {
        return Subject::query()
            ->whereKey($resultAnalysis->course_id)
            ->where('institution_id', $institutionId)
            ->exists();
    }
}
