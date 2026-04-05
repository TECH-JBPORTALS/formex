<?php

namespace App\Http\Controllers;

use App\Models\HigherEducation;
use App\Models\Student;
use App\Support\CurrentInstitutionSession;
use Illuminate\Http\Request;
use App\Models\Program;

class HigherEducationController
{
    /**
     * Display a listing of the resource.
     */
    public function listByStudent(Student $student)
    {
        $highereducations = $student->higher_educations()->get();
        return response()->json([
            'data' => $highereducations
        ]);
    }

    public function index(Request $request)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $highereducations = $institution->higher_educations()->get();
        return response()->json([
            'data' => $highereducations
        ]);
    }

    public function listByProgram(Program $program)
    {
        $highereducations = $program->higher_educations()->get();
        return response()->json([
            'data' => $highereducations
        ]);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Student $student)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $validated = $request->validate([
            'college_name' => 'required|string|max:255',
            'rank' => 'required|integer|min:1',
        ]);
        $highereducation = $student
            ->higher_educations()
            ->create(
                [
                    ...$validated,
                    "institution_id" => $student->institution->id,
                    "program_id" => $student->program->id,
                    "academic_year" => $institution->academic_year
                ]
            );
        return response()->json([
            'message' => 'Higher Education created successfully',
            'data' => $highereducation
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(HigherEducation $higher_education)
    {
        //
        return response()->json([
            'data' => $higher_education
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, HigherEducation $higher_education)
    {
        //
        $validated = $request->validate([
            'college_name' => 'required|string|max:255',
            'rank' => 'required|integer|min:1',
        ]);
        $higher_education->update($validated);
        return response()->json([
            'message' => 'Higher Education updated successfully',
            'data' => $higher_education
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(HigherEducation $higher_education)
    {
        //
        $higher_education->delete();
        return response()->json([
            'message' => 'Higher Education deleted successfully',
            'data' => $higher_education
        ]);
    }
}
