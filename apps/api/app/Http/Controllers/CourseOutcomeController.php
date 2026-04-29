<?php

namespace App\Http\Controllers;

use App\Http\Resources\CourseOutcomeResource;
use App\Models\CourseOutcome;
use App\Models\Subject;
use App\Support\CurrentInstitutionSession;
use Illuminate\Http\Request;

class CourseOutcomeController
{
    public function index(Request $request)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $outcomes = $institution
            ->course_outcomes()
            ->with(['program', 'course'])
            ->latest()
            ->get();

        return CourseOutcomeResource::collection($outcomes);
    }

    public function listByCourse(Request $request, Subject $subject)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $subject = $institution->subjects()->whereKey($subject->id)->firstOrFail();
        $outcomes = $subject
            ->course_outcomes()
            ->with(['program', 'course'])
            ->latest()
            ->get();

        return CourseOutcomeResource::collection($outcomes);
    }

    public function store(Request $request, Subject $subject): CourseOutcomeResource
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $subject = $institution->subjects()->whereKey($subject->id)->firstOrFail();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'syllabus_scheme' => ['nullable', 'string'],
            'target_percentage' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $outcome = $subject->course_outcomes()->create([
            ...$validated,
            'institution_id' => $institution->id,
            'program_id' => $subject->program_id,
            'type' => 'program_outcome',
            'academic_year' => $institution->academic_year,
        ]);

        return CourseOutcomeResource::make($outcome->loadMissing(['program', 'course']));
    }

    public function show(Request $request, CourseOutcome $courseOutcome): CourseOutcomeResource
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        abort_unless($courseOutcome->institution_id === $institution->id, 404);

        return CourseOutcomeResource::make($courseOutcome->loadMissing(['program', 'course']));
    }

    public function update(Request $request, CourseOutcome $courseOutcome): CourseOutcomeResource
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        abort_unless($courseOutcome->institution_id === $institution->id, 404);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'syllabus_scheme' => ['nullable', 'string'],
            'target_percentage' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $courseOutcome->update([
            ...$validated,
            'academic_year' => $institution->academic_year,
        ]);

        return CourseOutcomeResource::make($courseOutcome->loadMissing(['program', 'course']));
    }

    public function destroy(Request $request, CourseOutcome $courseOutcome): CourseOutcomeResource
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        abort_unless($courseOutcome->institution_id === $institution->id, 404);

        $courseOutcome->delete();

        return CourseOutcomeResource::make($courseOutcome->loadMissing(['program', 'course']));
    }
}
