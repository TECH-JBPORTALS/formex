<?php

namespace App\Http\Controllers;

use App\Http\Resources\BridgeResource;
use App\Models\Program;
use App\Models\Subject;
use App\Models\Bridge;
use App\Support\CurrentInstitutionSession;
use Illuminate\Http\Request;

class BridgreController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $bridges = $institution->bridges()->with('program', 'subject')->get();
        return BridgeResource::collection($bridges);
    }

    public function listByProgram(Program $program)
    {
        $bridges = $program->bridges()->with('subject')->get();
        return BridgeResource::collection($bridges);
    }
    public function listBySubject(Subject $subject)
    {
        $bridges = $subject->bridges()->get();
        return BridgeResource::collection($bridges);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Subject $subject)
    {
        //
        $institution = CurrentInstitutionSession::requireInstitution($request);

        $validated = $request->validate([
            'curriculum_gap' => 'required|string',
            'details' => 'required|string',
            'conducted_date' => 'required|date',
            'venue' => 'required|string',
            'resource_person_name' => 'required|string',
            'company_name' => 'required|string',
            'designation' => 'required|string',
            'students_present' => 'required|integer',
            'relevance' => 'required|string',
            'course_coordinator_id' => 'required|ulid|exists:users,id',
        ]);
        $bridge = $subject->bridges()->create([
            ...$validated,
            'institution_id' => $subject->institution_id,
            'program_id' => $subject->program_id,
            'subject_id' => $subject->id,
            'academic_year' => $institution->academic_year,
            'semester' => $subject->semester,
        ]);
        return BridgeResource::make($bridge);
    }

    /**
     * Display the specified resource.
     */
    public function show(Bridge $bridge)
    {
        //
        return BridgeResource::make($bridge->load('subject', 'program'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Bridge $bridge)
    {
        //
        $validated = $request->validate([
            'curriculum_gap' => 'required|string',
            'details' => 'required|string',
            'conducted_date' => 'required|date',
            'venue' => 'required|string',
            'resource_person_name' => 'required|string',
            'company_name' => 'required|string',
            'designation' => 'required|string',
            'students_present' => 'required|integer',
            'relevance' => 'required|string',
            'academic_year' => 'required|integer',
            'course_coordinator_id' => 'required|ulid|exists:users,id',
        ]);
        $subjectSemester = Subject::query()
            ->whereKey($bridge->subject_id)
            ->value('semester');

        $bridge->update([
            ...$validated,
            'semester' => $subjectSemester ?? $bridge->semester,
        ]);
        return BridgeResource::make($bridge);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Bridge $bridge)
    {
        //
        $bridge->delete();
        return BridgeResource::make($bridge);
    }
}
