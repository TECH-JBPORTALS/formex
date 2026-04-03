<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use App\Models\Program;
use Illuminate\Http\Request;

class ProgramController
{
    // 📄 List programs
    public function index(Institution $institution)
    {
        $programs = $institution->programs()->latest()->get();

        return response()->json(["data" => $programs]);
    }

    // ➕ Create program
    public function store(Request $request, Institution $institution)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'short_name' => 'required|string|max:50',
            'intake' => 'required|integer|min:1',
        ]);

        $program = $institution->programs()->create($validated);

        return response()->json([
            'message' => 'Program created successfully',
            'data' => $program
        ], 201);
    }

    // 🔍 Show program
    public function show(Institution $institution, Program $program)
    {
        return response()->json(["data" => $program]);
    }

    // ✏️ Update program
    public function update(Request $request, Institution $institution, Program $program)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'short_name' => 'sometimes|required|string|max:50',
            'intake' => 'sometimes|required|integer|min:1',
        ]);

        $program->update($validated);

        return response()->json([
            'message' => 'Program updated successfully',
            'data' => $program
        ]);
    }

    // 🗑️ Delete program
    public function destroy(Institution $institution, Program $program)
    {
        $program->delete();

        return response()->json([
            'message' => 'Program deleted successfully',
            "data" => $program
        ]);
    }
}
