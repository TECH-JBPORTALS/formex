<?php

namespace App\Http\Controllers;

use App\Models\Program;
use App\Models\Student;
use App\Support\CurrentInstitutionSession;
use Illuminate\Http\Request;

class StudentController
{
    // 📄 List students
    public function index(Request $request, Program $program)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        /** @var Program $scopedProgram */
        $scopedProgram = $institution->programs()->whereKey($program->id)->firstOrFail();

        $students = $scopedProgram->students()
            ->latest()
            ->get();

        return response()->json([
            'data' => $students,
        ]);
    }

    // ➕ Create student (strictly under institution → program)
    public function store(Request $request, Program $program)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        /** @var Program $scopedProgram */
        $scopedProgram = $institution->programs()->whereKey($program->id)->firstOrFail();

        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'date_of_birth' => 'nullable|date',
            'semester' => 'required|integer|min:1',
            'academic_year' => 'required|integer|min:2000',
            'register_no' => 'nullable|string|max:100',
            'gender' => 'nullable|in:male,female',
            'category' => 'nullable|string',
            'email' => 'nullable|email',
            'mobile' => 'nullable|string|max:20',
            'appar_id' => 'nullable|string|max:100',
        ]);

        $student = $scopedProgram->students()->create([
            ...$validated,
            // Institution comes from the program, not from the route.
            'institution_id' => $scopedProgram->institution_id,
        ]);

        return response()->json([
            'message' => 'Student created successfully',
            'data' => $student,
        ], 201);
    }

    // 🔍 Show student
    public function show(Request $request, Program $program, Student $student)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        /** @var Program $scopedProgram */
        $scopedProgram = $institution->programs()->whereKey($program->id)->firstOrFail();

        // Scoped route model binding should ensure this, but keep a safety guard.
        if ($student->program_id !== $scopedProgram->id) {
            return response()->json([
                'message' => 'Student does not belong to this program',
            ], 404);
        }

        return response()->json([
            'data' => $student,
        ]);
    }

    // ✏️ Update student (same chain enforcement)
    public function update(Request $request, Program $program, Student $student)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        /** @var Program $scopedProgram */
        $scopedProgram = $institution->programs()->whereKey($program->id)->firstOrFail();

        if ($student->program_id !== $scopedProgram->id) {
            return response()->json([
                'message' => 'Student does not belong to this program',
            ], 404);
        }

        $validated = $request->validate([
            'full_name' => 'sometimes|required|string|max:255',
            'date_of_birth' => 'nullable|date',
            'semester' => 'sometimes|required|integer|min:1',
            'academic_year' => 'sometimes|required|integer|min:2000',
            'register_no' => 'nullable|string|max:100',
            'gender' => 'nullable|string',
            'category' => 'nullable|string',
            'email' => 'nullable|email',
            'mobile' => 'nullable|string|max:20',
            'appar_id' => 'nullable|string|max:100',
            'is_approved' => 'sometimes|boolean',
        ]);

        $student->update($validated);

        return response()->json([
            'message' => 'Student updated successfully',
            'data' => $student,
        ]);
    }

    // 🗑️ Delete student
    public function destroy(Request $request, Program $program, Student $student)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        /** @var Program $scopedProgram */
        $scopedProgram = $institution->programs()->whereKey($program->id)->firstOrFail();

        if ($student->program_id !== $scopedProgram->id) {
            return response()->json([
                'message' => 'Student does not belong to this program',
            ], 404);
        }

        $student->delete();

        return response()->json([
            'message' => 'Student deleted successfully',
        ]);
    }
}
