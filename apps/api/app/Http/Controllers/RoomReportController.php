<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use App\Models\Program;
use App\Models\Roomreport;
use App\Models\Subject;
use Illuminate\Foundation\Auth\User;
use Illuminate\Http\Request;

class RoomReportController
{
    /**
     * Display a listing of the resource.
     */
    public function listByInstitution(Institution $institution)
    {
        $roomreports = $institution->roomreports()->get();
        return response()->json([
            'data' => $roomreports
        ]);
    }
    public function listByProgram(Program $program) {
        $roomreports = $program->roomreports()->get();
        return response()->json([
            'data' => $roomreports
        ]);
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Institution $institution, Program $program, Subject $subject, User $user)
    {
        //
        if ($program->institution_id !== $institution->id) {
            return response()->json([
                'message' => 'Program does not belong to this institution'
            ], 404);
        }
        if ($subject->program_id !== $program->id) {
            return response()->json([
                'message' => 'Subject does not belong to this program'
            ], 404);
        }
        if ($user->subject_id !== $subject->id) {
            return response()->json([
                'message' => 'Cc does not belong to this subject'
            ], 404);
        }
        $validated = $request->validate([
            'room_number' => 'required|string|max:255',
            'acad_year' => 'required|integer|min:2000',
            'semester' => 'required|integer|min:1',
            'strength' => 'required|integer|min:1',
            'present' => 'required|integer|min:1',
            'attendance_register' => 'required|in: Maintained, Not Maintained',
            'student_attendance' => 'required|in: Present, Absent',
            'topic_planned' => 'required|string|max:255',
            'topic_taught' => 'required|string|max:255',
            'pedagogy_used' => 'required|string|max:255',
            'aids_used' => 'required|string|max:255',
            'teaching_skill' => 'required|in: Satisfactory,Good',
            'interaction' => 'required|in:Satisfactory,Good',
            'learning_outcome' => 'required|in: Achieved,Not Achieved',
            'valuation' => 'required|in:Done,Not Done',
            'principal_remarks' => 'required|string|max:255',
            'report_date' => 'required|date',
        ]);
        $roomreport = $user->roomreports()->create([...$validated, "institution_id" => $institution->id, "program_id" => $program->id, "subject_id" => $subject->id, "user_id" => $user->id]);
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
            'acad_year' => 'sometimes|required|integer|min:2000',
            'semester' => 'sometimes|required|integer|min:1',
            'strength' => 'sometimes|required|integer|min:1',
            'present' => 'sometimes|required|integer|min:1',
            'attendance_register' => 'sometimes|required|in: Maintained, Not Maintained',
            'student_attendance' => 'sometimes|required|in: Present, Absent',
            'topic_planned' => 'sometimes|required|string|max:255',
            'topic_taught' => 'sometimes|required|string|max:255',
            'pedagogy_used' => 'sometimes|required|string|max:255',
            'aids_used' => 'sometimes|required|string|max:255',
            'teaching_skill' => 'sometimes|required|in: Satisfactory,Good',
            'interaction' => 'sometimes|required|in:Satisfactory,Good',
            'learning_outcome' => 'sometimes|required|in: Achieved,Not Achieved',
            'valuation' => 'sometimes|required|in:Done,Not Done',
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
