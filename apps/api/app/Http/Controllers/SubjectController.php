<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use App\Models\Program;
use App\Models\Subject;
use Illuminate\Http\Request;

class SubjectController
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $subjects = Subject::all();

        return response()->json(["data" => $subjects]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Institution $institution, Program $program)
    {
        if ($program->institution_id !== $institution->id) {
            return response()->json([
                'message' => 'Program does not belong to this institution'
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'short_name' => 'required|string|max:10',
            'type' => 'required|in:theory,practical'
        ]);

        $subject = $program->subjects()->create([...$validated, "institution_id" => $institution->id]);
        return response()->json(["data" => $subject]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Subject $subject)
    {
        //
        
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Subject $subject)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Subject $subject)
    {
        //
    }

    public function showFamous()
    {

    }
}
