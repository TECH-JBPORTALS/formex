<?php

namespace App\Http\Controllers;

use App\Models\Internship;
use App\Models\Student;
use App\Support\CurrentInstitutionSession;
use Illuminate\Http\Request;
use App\Models\Program;

class InternshipController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $internships = $institution->internships()
            ->latest()
            ->get();
        return response()->json([
            'data' => $internships
        ]);
    }

    public function listByProgram(Program $program)
    {
        $internships = $program->internships()
            ->latest()
            ->get();
        return response()->json([
            'data' => $internships
        ]);
    }

    public function listByStudent(Student $student)
    {
        $internships = $student->internships()
            ->latest()
            ->get();
        return response()->json([
            'data' => $internships
        ]);
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Student $student)
    {
        //
        $validated = $request->validate([
            'industry_name' => 'required|string|max:255',
            'industry_address' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'from_date' => 'required|date',
            'to_date' => 'required|date',
            'semester' => 'required|integer|min:1',
            'acad_year' => 'required|integer|min:2000',
        ]);
        $internship = $student->internships()->create([...$validated, "institution_id" => $student->institution_id, "program_id" => $student->program_id]);
        return response()->json([
            'message' => 'Internship created successfully',
            'data' => $internship
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Internship $internship)
    {
        //
        return response()->json([
            'data' => $internship
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Internship $internship)
    {
        //
        $validated = $request->validate([
            'industry_name' => 'sometimes|required|string|max:255',
            'industry_address' => 'sometimes|required|string|max:255',
            'role' => 'sometimes|required|string|max:255',
            'from_date' => 'sometimes|required|date',
            'to_date' => 'sometimes|required|date',
            'semester' => 'sometimes|required|integer|min:1',
            'acad_year' => 'sometimes|required|integer|min:2000',
        ]);
        $internship->update($validated);
        return response()->json([
            'message' => 'Internship updated successfully',
            'data' => $internship
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Internship $internship)
    {
        //
        $internship->delete();
        return response()->json([
            'message' => 'Internship deleted successfully',
            'data' => $internship
        ]);
    }
}
