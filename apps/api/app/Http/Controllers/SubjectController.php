<?php

namespace App\Http\Controllers;

use App\Models\Program;
use App\Models\Subject;
use App\Support\CurrentInstitutionSession;
use Illuminate\Http\Request;

class SubjectController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $subjects = $institution->subjects()->with('program')->orderBy('program_id', 'asc')->orderBy('semester', 'asc')->groupBy(['program_id', 'id'])->get();
        return response()->json(["data" => $subjects]);
    }

    public function listByProgram(Program $program)
    {
        $subjects = $program->subjects()->get();
        return response()->json(["data" => $subjects]);
    }

    public function listbysemester(Request $request, Program $program, int $semester)
    {
        $subjects = $program->subjects()->where('semester', $semester)->get();
        return response()->json(["data" => $subjects]);
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Program $program)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);

        /** @var Program $program */
        $program = $institution->programs()->whereKey($program->id)->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'short_name' => 'required|string|max:10',
            'type' => 'required|in:theory,practical',
            'semester' => 'required|integer|min:1',
            'scheme' => 'required|in:C25',
        ]);

        $subject = $program->subjects()->create([...$validated, "institution_id" => $program->institution_id, "program_id" => $program->id]);
        return response()->json(["data" => $subject]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Subject $subject)
    {
        //
        return response()->json(["data" => $subject]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Subject $subject)
    {
        //
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'short_name' => 'sometimes|required|string|max:10',
            'type' => 'sometimes|required|in:theory,practical',
            'semester' => 'sometimes|required|integer|min:1',
            'scheme' => 'sometimes|required|in:C25',
        ]);
        $subject->update($validated);
        return response()->json(["data" => $subject]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Subject $subject)
    {
        //
        $subject->delete();
        return response()->json(["data" => $subject]);
    }


}
