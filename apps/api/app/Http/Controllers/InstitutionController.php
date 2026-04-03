<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use App\Support\CurrentInstitutionSession;
use Illuminate\Http\Request;

class InstitutionController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $institutions = $request->user()
            ->institutions()
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $institutions]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255',
            'address' => 'required|string',
            'type' => 'required|in:government,aided,private',
        ]);

        $institution = Institution::create($validated);
        $request->user()->institutions()->attach($institution->id, ['role' => 'principal']);
        $request->session()->put(CurrentInstitutionSession::SESSION_KEY, $institution->id);

        return response()->json(['message' => 'Institution created successfully', 'data' => $institution], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Institution $institution)
    {
        return response()->json(['data' => $institution]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Institution $institution)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'code' => 'string|max:255',
            'address' => 'string',
            'type' => 'in:government,aided,private',
        ]);
        $institution->update($validated);

        return response()->json(['message' => 'Institution updated successfully', 'data' => $institution]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Institution $institution)
    {
        $institution->deleteOrFail();

        return response()->json(['message' => 'Institution deleted successfully', 'data' => $institution]);
    }
}
