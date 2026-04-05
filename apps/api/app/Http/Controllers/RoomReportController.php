<?php

namespace App\Http\Controllers;

use App\Models\Program;
use App\Models\Roomreport;
use App\Models\Subject;
use App\Models\User;
use App\Support\CurrentInstitutionSession;
use Illuminate\Http\Request;

class RoomReportController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $roomreports = $institution->roomreports()->latest()->get();
        return response()->json([
            'data' => $roomreports
        ]);
    }
    public function listByProgram(Program $program)
    {
        $roomreports = $program->roomreports()->get();
        return response()->json([
            'data' => $roomreports
        ]);
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Program $program, Subject $subject, User $user)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);

        $validated = $request->validate([
            'room_number' => 'required|string|max:255',
            'semester' => 'required|integer|min:1',
            'strength' => 'required|integer|min:1',
            'present' => 'required|integer|min:1',
            'attendance_register' => 'required|in: maintained, not_maintained',
            'student_attendance' => 'required|in: present, absent',
            'topic_planned' => 'required|string|max:255',
            'topic_taught' => 'required|string|max:255',
            'pedagogy_used' => 'required|string|max:255',
            'aids_used' => 'required|string|max:255',
            'teaching_skill' => 'required|in: satisfactory,good',
            'interaction' => 'required|in:satisfactory,good',
            'learning_outcome' => 'required|in: achieved,not_achieved',
            'valuation' => 'required|in:done,not_done',
            'principal_remarks' => 'required|string|max:255',
            'report_date' => 'required|date',
        ]);
        $roomreport = $user
            ->roomreports()
            ->create(
                [
                    ...$validated,
                    "institution_id" => $program->institution_id,
                    "program_id" => $program->id,
                    "subject_id" => $subject->id,
                    "user_id" => $user->id,
                    "academic_year" => $institution->academic_year
                ]
            );

        return response()->json([
            'message' => 'Room report created successfully',
            'data' => $roomreport
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Roomreport $roomreport)
    {
        //
        return response()->json([
            'data' => $roomreport
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Roomreport $roomreport)
    {
        //
        $validated = $request->validate([
            'room_number' => 'sometimes|required|string|max:255',
            'semester' => 'sometimes|required|integer|min:1',
            'strength' => 'sometimes|required|integer|min:1',
            'present' => 'sometimes|required|integer|min:1',
            'attendance_register' => 'sometimes|required|in:maintained,not_maintained',
            'student_attendance' => 'sometimes|required|in:present,absent',
            'topic_planned' => 'sometimes|required|string|max:255',
            'topic_taught' => 'sometimes|required|string|max:255',
            'pedagogy_used' => 'sometimes|required|string|max:255',
            'aids_used' => 'sometimes|required|string|max:255',
            'teaching_skill' => 'sometimes|required|in:satisfactory,good',
            'interaction' => 'sometimes|required|in:satisfactory,good',
            'learning_outcome' => 'sometimes|required|in:achieved,not_achieved',
            'valuation' => 'sometimes|required|in:done,not_done',
            'principal_remarks' => 'sometimes|required|string|max:255',
            'report_date' => 'sometimes|required|date',
        ]);
        $roomreport->update($validated);
        return response()->json([
            'message' => 'Room report updated successfully',
            'data' => $roomreport
        ]);
        if (!$roomreport) {
            return response()->json([
                'message' => 'Room report not found'
            ], 404);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Roomreport $roomreport)
    {
        //
        $roomreport->delete();
        return response()->json([
            'message' => 'Room report deleted successfully',
            'data' => $roomreport
        ]);
        if (!$roomreport) {
            return response()->json([
                'message' => 'Room report not found'
            ], 404);
        }
    }
}
