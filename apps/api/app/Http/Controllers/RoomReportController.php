<?php

namespace App\Http\Controllers;

use App\Models\Program;
use App\Models\RoomReport;
use App\Models\Subject;
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
        $roomreports = $institution->room_reports()->latest()->get();

        return response()->json([
            'data' => $roomreports,
        ]);
    }

    public function listByProgram(Program $program)
    {
        $roomreports = $program->room_reports()->get();

        return response()->json([
            'data' => $roomreports,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);

        $validated = $request->validate([
            'program_id' => 'required|string|exists:programs,id',
            'subject_id' => 'required|string|exists:subjects,id',
            'room_number' => 'required|string|max:255',
            'semester' => 'required|integer|min:1',
            'strength' => 'required|integer|min:1',
            'present' => 'required|integer|min:1',
            'attendance_register' => 'required|in:maintained,not_maintained',
            'student_attendance' => 'sometimes|nullable|in:present,absent',
            'topic_planned' => 'required|string|max:255',
            'topic_taught' => 'required|string|max:255',
            'pedagogy_used' => 'required|string|max:255',
            'aids_used' => 'required|string|max:255',
            'teaching_skill' => 'required|in:satisfactory,good',
            'interaction' => 'required|in:satisfactory,good',
            'learning_outcome' => 'required|in:achieved,not_achieved',
            'valuation' => 'required|in:done,not_done',
            'principal_remarks' => 'required|string|max:255',
            'report_date' => 'required|date',
        ]);

        $validated['student_attendance'] = $validated['student_attendance'] ?? 'present';

        /** @var Program $program */
        $program = $institution->programs()->whereKey($validated['program_id'])->firstOrFail();
        /** @var Subject $subject */
        $subject = $institution->subjects()
            ->whereKey($validated['subject_id'])
            ->where('program_id', $program->id)
            ->firstOrFail();

        $roomreport = RoomReport::query()->create([
            ...$validated,
            'institution_id' => $institution->id,
            'program_id' => $program->id,
            'subject_id' => $subject->id,
            'users_id' => (string) $request->user()->id,
            'academic_year' => $institution->academic_year,
        ]);

        return response()->json([
            'message' => 'Room report created successfully',
            'data' => $roomreport,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(RoomReport $room_report)
    {
        //
        return response()->json([
            'data' => $room_report,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RoomReport $room_report)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        abort_unless($room_report->institution_id === $institution->id, 404);

        $validated = $request->validate([
            'program_id' => 'sometimes|required|string|exists:programs,id',
            'subject_id' => 'sometimes|required|string|exists:subjects,id',
            'room_number' => 'sometimes|required|string|max:255',
            'semester' => 'sometimes|required|integer|min:1',
            'strength' => 'sometimes|required|integer|min:1',
            'present' => 'sometimes|required|integer|min:1',
            'attendance_register' => 'sometimes|required|in:maintained,not_maintained',
            'student_attendance' => 'sometimes|nullable|in:present,absent',
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

        if (isset($validated['program_id'])) {
            /** @var Program $program */
            $program = $institution->programs()->whereKey($validated['program_id'])->firstOrFail();
            $validated['program_id'] = $program->id;
        }

        if (isset($validated['subject_id'])) {
            $programIdForSubject = $validated['program_id'] ?? $room_report->program_id;
            /** @var Subject $subject */
            $subject = $institution->subjects()
                ->whereKey($validated['subject_id'])
                ->where('program_id', $programIdForSubject)
                ->firstOrFail();
            $validated['subject_id'] = $subject->id;
        }

        $room_report->update($validated);

        return response()->json([
            'message' => 'Room report updated successfully',
            'data' => $room_report,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RoomReport $room_report)
    {
        //
        $room_report->delete();

        return response()->json([
            'message' => 'Room report deleted successfully',
            'data' => $room_report,
        ]);
        if (! $room_report) {
            return response()->json([
                'message' => 'Room report not found',
            ], 404);
        }
    }
}
