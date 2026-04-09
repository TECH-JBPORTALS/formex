<?php

namespace App\Http\Controllers;

use App\Models\Program;
use App\Models\Subject;
use App\Models\Bridge;
use App\Support\CurrentInstitutionSession;
use Illuminate\Foundation\Auth\User;
use Illuminate\Http\Request;

class BridgreController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $bridges = $institution->bridges()->get();
        return response()->json([
            'data' => $bridges,
        ]);
    }

    public function listByProgram(Program $program)
    {
        $bridges = $program->bridges()->get();
        return response()->json([
            'data' => $bridges,
        ]);
    }
    public function listBySubject(Subject $subject)
    {
        $bridges = $subject->bridges()->get();
        return response()->json([
            'data' => $bridges,
        ]);
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
            'semester' => 'required|integer',
            'course_coordinator_id' => 'required|ulid|exists:users,id',
        ]);
        $bridge = $subject->bridges()->create([
            ...$validated,
            'institution_id' => $subject->institution_id,
            'program_id'=>$subject->program_id,
            'subject_id' => $subject->id,
            'academic_year' => $institution->academic_year,
        ]);
        return response()->json([
            'data' => $bridge,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Bridge $bridge)
    {
        //
        return response()->json([
            'data' => $bridge,
        ]);
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
            'semester' => 'required|integer',
        ]);
        $bridge->update($validated);
        return response()->json([
            'data' => $bridge,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Bridge $bridge)
    {
        //
        $bridge->delete();
        return response()->json([
            'data' => $bridge,
            'message' => 'Bridge deleted successfully',
        ]);
    }
}
