<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Institution;
use App\Models\Program;
use Illuminate\Http\Request;

class StudentController
{
    // 📄 List students
    public function index(Institution $institution, Program $program)
    {
        $students = $program->students()
            ->latest()
            ->get();

        return response()->json([
            'data' => $students
        ]);
    }

    // ➕ Create student (strictly under institution → program)
    public function store(Request $request, Institution $institution, Program $program)
    {
        // 🔒 Extra safety (optional if using ->scoped())
        if ($program->institution_id !== $institution->id) {
            return response()->json([
                'message' => 'Program does not belong to this institution'
            ], 404);
        }

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

        $student = $program->students()->create([
            ...$validated,
            'institution_id' => $institution->id,
        ]);

        return response()->json([
            'message' => 'Student created successfully',
            'data' => $student
        ], 201);
    }

    // 🔍 Show student
    public function show(Institution $institution, Program $program, Student $student)
    {
        return response()->json([
            'data' => $student
        ]);
    }

    // ✏️ Update student (same chain enforcement)
    public function update(Request $request, Institution $institution, Program $program, Student $student)
    {
        if ($program->institution_id !== $institution->id) {
            return response()->json([
                'message' => 'Program does not belong to this institution'
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
            'data' => $student
        ]);
    }

    // 🗑️ Delete student
    public function destroy(Institution $institution, Program $program, Student $student)
    {
        $student->delete();

        return response()->json([
            'message' => 'Student deleted successfully'
        ]);
    }
}
