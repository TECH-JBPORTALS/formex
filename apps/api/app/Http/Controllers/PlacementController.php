<?php

namespace App\Http\Controllers;

use App\Http\Resources\PlacementResource;
use App\Models\Placement;
use App\Models\Program;
use App\Models\Student;
use App\Support\CurrentInstitutionSession;
use Illuminate\Http\Request;

class PlacementController
{
    /**
     * List the placements in active institution.
     */
    public function index(Request $request)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $placements = $institution->placements()->with('student')->with('program')->latest()->get();

        return PlacementResource::collection($placements);
    }

    /**
     * List the placements in program.
     */
    public function listByProgram(Program $program)
    {
        $placements = $program->placements()->with('student')->latest()->get();

        return PlacementResource::collection($placements);
    }

    public function listByStudent(Student $student)
    {
        $placements = $student->placements()->with('student')->latest()->get();

        return PlacementResource::collection($placements);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Student $student)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $validated = $request->validate([
            'industry_name' => 'required|string|max:255',
            'industry_address' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'ctc' => 'required|string|max:255',
        ]);

        $placement = $student
            ->placements()
            ->create(
                [
                    ...$validated,
                    'institution_id' => $student->institution_id,
                    'program_id' => $student->program_id,
                    'academic_year' => $institution->academic_year,
                ]
            );

        return response()->json([
            'message' => 'Placement created successfully',
            'data' => PlacementResource::make($placement->loadMissing('student')),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Placement $placement)
    {
        return response()->json([
            'data' => PlacementResource::make($placement->loadMissing('student')),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Placement $placement)
    {
        //
        $validated = $request->validate([
            'industry_name' => 'required|string|max:255',
            'industry_address' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'ctc' => 'required|string|max:255',
        ]);
        $placement->update($validated);

        return response()->json([
            'message' => 'Internship updated successfully',
            'data' => PlacementResource::make($placement->loadMissing('student')),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Placement $placement)
    {
        //
        $placement->delete();

        return response()->json([
            'message' => 'Internship deleted successfully',
            'data' => PlacementResource::make($placement->loadMissing('student')),
        ]);
    }
}
