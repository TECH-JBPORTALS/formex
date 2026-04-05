<?php

namespace App\Http\Controllers;

use App\Models\Program;
use App\Models\Student;
use App\Support\CurrentInstitutionSession;
use Illuminate\Http\Request;
use App\Models\SkillProgram;
class SkillProgramController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $skillprograms = $institution->skillPrograms()
            ->latest()
            ->get();
        return response()->json([
            'data' => $skillprograms
        ]);
    }
    public function listByProgram(Program $program)
    {
        $skillprograms = $program->skillPrograms()->get();
        return response()->json(["data" => $skillprograms]);
    }
    public function listBySemester(Program $program,int $semester)
    {
        $skillprograms = $program->skillPrograms()->where('semester', $semester)->get();
        return response()->json(["data" => $skillprograms]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Student $student)
    {
        //
        $validated = $request->validate([
            'semester' => 'required|integer|min:1',
            'details' => 'required|string|max:255',
            'resource_person_name' => 'required|string|max:255',
            'company_name' => 'required|string|max:255',
            'designation' => 'required|string|max:255',
            'conducted_date' => 'required|date',
            'academic_year' => 'required|integer|min:2000',
        ]);
        $skillprogram = $student->skillPrograms()->create([...$validated, "institution_id" => $student->institution_id, "program_id" => $student->program_id, "student_id" => $student->id]);
        return response()->json(["data" => $skillprogram]);

    }

    /**
     * Display the specified resource.
     */
    public function show(SkillProgram $skill_program)
    {
        //
        return response()->json(["data" => $skill_program]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SkillProgram $skill_program)
    {
        //
        $validated = $request->validate([
            'semester' => 'sometimes|required|integer|min:1',
            'details' => 'sometimes|required|string|max:255',
            'resource_person_name' => 'sometimes|required|string|max:255',
            'company_name' => 'sometimes|required|string|max:255',
            'designation' => 'sometimes|required|string|max:255',
            'conducted_date' => 'sometimes|required|date',
            'academic_year' => 'sometimes|required|integer|min:2000',
        ]);
        $skill_program->update([...$validated, "institution_id" => $skill_program->institution_id, "program_id" => $skill_program->program_id, "student_id" => $skill_program->student_id]);
        return response()->json(["data" => $skill_program]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SkillProgram $skillprogram)
    {
        //
        $skillprogram->delete();
        return response()->json(["data" => $skillprogram]);
    }
}
