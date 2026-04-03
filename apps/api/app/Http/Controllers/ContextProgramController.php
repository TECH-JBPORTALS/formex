<?php

namespace App\Http\Controllers;

use App\Support\CurrentInstitutionSession;
use Illuminate\Http\Request;

class ContextProgramController
{
    public function index(Request $request)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);

        $programs = $institution->programs()->latest()->get();

        return response()->json(['data' => $programs]);
    }

    public function store(Request $request)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'short_name' => 'required|string|max:50',
            'intake' => 'required|integer|min:1',
        ]);

        $program = $institution->programs()->create($validated);

        return response()->json([
            'message' => 'Program created successfully',
            'data' => $program,
        ], 201);
    }

    public function show(Request $request, string $program)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $model = $institution->programs()->whereKey($program)->firstOrFail();

        return response()->json(['data' => $model]);
    }

    public function update(Request $request, string $program)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $model = $institution->programs()->whereKey($program)->firstOrFail();

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'short_name' => 'sometimes|required|string|max:50',
            'intake' => 'sometimes|required|integer|min:1',
        ]);

        $model->update($validated);

        return response()->json([
            'message' => 'Program updated successfully',
            'data' => $model,
        ]);
    }

    public function destroy(Request $request, string $program)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $model = $institution->programs()->whereKey($program)->firstOrFail();

        $model->delete();

        return response()->json([
            'message' => 'Program deleted successfully',
            'data' => $model,
        ]);
    }
}
