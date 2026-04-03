<?php

namespace App\Http\Controllers;

use App\Models\Highereducation;
use App\Models\Student;
use Illuminate\Http\Request;
use App\Models\Institution;
use App\Models\Program;

class HigherEducationController
{
    /**
     * Display a listing of the resource.
     */
    public function listByStudent(Student $student)
    {
        $highereducations = $student->highereducations()->get();
        return response()->json([
            'data' => $highereducations
        ]);
    }

    public function listByInstitution(Institution $institution)
    {
        $highereducations = $institution->highereducations()->get();
        return response()->json([
            'data' => $highereducations
        ]);
    }

    public function listByProgram(Program $program)
    {
        $highereducations = $program->highereducations()->get();
        return response()->json([
            'data' => $highereducations
        ]);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Student $student)
    {
        //
        $validated = $request->validate([
            'college_name' => 'required|string|max:255',
            'rank' => 'required|integer|min:1',
            'acad_year' => 'required|integer|min:2000',
        ]);
        $highereducation = $student->highereducations()->create([...$validated, "institution_id" => $student->institution->id, "program_id" => $student->program->id]);
        return response()->json([
            'message' => 'Higher Education created successfully',
            'data' => $highereducation
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Highereducation $highereducation)
    {
        //
        return response()->json([
            'data' => $highereducation
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Highereducation $highereducation)
    {
        //
        $validated = $request->validate([
            'college_name' => 'required|string|max:255',
            'rank' => 'required|integer|min:1',
            'acad_year' => 'required|integer|min:2000',
        ]);
        $highereducation->update($validated);
        return response()->json([
            'message' => 'Higher Education updated successfully',
            'data' => $highereducation
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Highereducation $highereducation)
    {
        //
        $highereducation->delete();
        return response()->json([
            'message' => 'Higher Education deleted successfully',
            'data' => $highereducation
        ]);
    }
}
