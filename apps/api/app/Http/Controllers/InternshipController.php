<?php

namespace App\Http\Controllers;

use App\Http\Resources\InternshipResource;
use App\Models\Internship;
use App\Models\Program;
use App\Models\Student;
use App\Support\CurrentInstitutionSession;
use Illuminate\Http\Request;

class InternshipController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $internships = $institution->internships()
            ->with(['student', 'program'])
            ->latest()
            ->get();

        return InternshipResource::collection($internships);
    }

    public function listByProgram(Program $program)
    {
        $internships = $program->internships()
            ->with(['student', 'program'])
            ->latest()
            ->get();

        return InternshipResource::collection($internships);
    }

    public function listByStudent(Student $student)
    {
        $internships = $student->internships()
            ->with(['student', 'program'])
            ->latest()
            ->get();

        return InternshipResource::collection($internships);
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
            /** @format date */
            'from_date' => 'required|date',
            /** @format date */
            'to_date' => 'required|date',
        ]);

        $internship = $student
            ->internships()
            ->create(
                [
                    ...$validated,
                    'institution_id' => $student->institution_id,
                    'program_id' => $student->program_id,
                    'academic_year' => $institution->academic_year,
                    'semester' => $student->semester,
                ]
            );

        return response()->json([
            'message' => 'Internship created successfully',
            'data' => InternshipResource::make(
                $internship->loadMissing(['student', 'program'])
            ),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Internship $internship)
    {
        return response()->json([
            'data' => InternshipResource::make(
                $internship->loadMissing(['student', 'program'])
            ),
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
        ]);
        $internship->update($validated);

        return response()->json([
            'message' => 'Internship updated successfully',
            'data' => InternshipResource::make(
                $internship->loadMissing(['student', 'program'])
            ),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Internship $internship)
    {
        $internship->delete();

        return response()->json([
            'message' => 'Internship deleted successfully',
            'data' => InternshipResource::make(
                $internship->loadMissing(['student', 'program'])
            ),
        ]);
    }
}
