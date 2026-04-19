<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BridgreController;
use App\Http\Controllers\FacultyInvitationController;
use App\Http\Controllers\HigherEducationController;
use App\Http\Controllers\InstitutionController;
use App\Http\Controllers\InstitutionFacultyController;
use App\Http\Controllers\InternshipController;
use App\Http\Controllers\PlacementController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\RoomReportController;
use App\Http\Controllers\SkillProgramController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\StudentFeedbackController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\TimetableController;
use Illuminate\Support\Facades\Route;

Route::middleware('web')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:web');
    Route::post('/faculty-invitations/accept', [FacultyInvitationController::class, 'accept']);
    Route::get('/faculty-invitations/{token}', [FacultyInvitationController::class, 'show']);
    Route::get('/student-feedback/links/{token}', [StudentFeedbackController::class, 'linkShow']);
    Route::post('/student-feedback/links/{token}/start', [StudentFeedbackController::class, 'linkStart']);
    Route::post('/student-feedback/links/{token}/submit', [StudentFeedbackController::class, 'linkSubmit']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/user/current-institution', [AuthController::class, 'setCurrentInstitution']);
    Route::post('/user/academic-year', [AuthController::class, 'setAcademicYear']);

    Route::apiResource('institutions', InstitutionController::class);

    Route::middleware('institution.role:principal')->group(function () {
        Route::apiResource('/institutions/current/faculty', InstitutionFacultyController::class);
        Route::post('/institutions/current/faculty/invitations', [FacultyInvitationController::class, 'store']);
    });

    Route::middleware('institution.role:principal,program_coordinator,course_coordinator')->group(function () {
        Route::get('/feedback/questions', [StudentFeedbackController::class, 'questionIndex']);
        Route::post('/feedback/questions', [StudentFeedbackController::class, 'questionStore']);
        Route::delete('/feedback/questions/{feedbackQuestion}', [StudentFeedbackController::class, 'questionDestroy']);
        Route::get('/feedback/links', [StudentFeedbackController::class, 'linkIndex']);
        Route::get('/feedback/submissions', [StudentFeedbackController::class, 'submissionsIndex']);
        Route::post('/feedback/links', [StudentFeedbackController::class, 'linkStore']);
        Route::delete('/feedback/links/{feedbackLink}', [StudentFeedbackController::class, 'linkDestroy']);
        Route::get('/feedback/links/{feedbackLink}/responses', [StudentFeedbackController::class, 'facultyIndex']);
        Route::delete('/feedback/links/{feedbackLink}/responses/{student}', [StudentFeedbackController::class, 'facultyDestroy']);
    });

    Route::apiResource('programs', ProgramController::class);

    Route::apiResource('programs.students', StudentController::class);
    Route::get('/students', [StudentController::class, 'search']);

    Route::apiResource('subjects', SubjectController::class)->except(['store']);
    Route::get('/programs/{program}/subjects', [SubjectController::class, 'listByProgram']);
    Route::get('/programs/{program}/subjects/{semester}', [SubjectController::class, 'listbysemester']);
    Route::post('/programs/{program}/subjects', [SubjectController::class, 'store']);
    Route::get('/programs/{program}/timetable', [TimetableController::class, 'show']);
    Route::put('/programs/{program}/timetable', [TimetableController::class, 'upsertSlot']);
    Route::get('/timetable/personal', [TimetableController::class, 'personal']);

    Route::apiResource('internships', InternshipController::class)->except(['store']);
    Route::get('/programs/{program}/internships', [InternshipController::class, 'listByProgram']);
    Route::get('/students/{student}/internships', [InternshipController::class, 'listByStudent']);
    Route::post('/students/{student}/internships', [InternshipController::class, 'store']);

    Route::apiResource('placements', PlacementController::class)->except(['store']);
    Route::get('/programs/{program}/placements', [PlacementController::class, 'listByProgram']);
    Route::get('/students/{student}/placements', [PlacementController::class, 'listByStudent']);
    Route::post('/students/{student}/placements', [PlacementController::class, 'store']);

    Route::apiResource('higher-educations', HigherEducationController::class)->except(['store']);
    Route::get('/students/{student}/higher-educations', [HigherEducationController::class, 'listByStudent']);
    Route::get('/programs/{program}/higher-educations', [HigherEducationController::class, 'listByProgram']);
    Route::post('/students/{student}/higher-educations', [HigherEducationController::class, 'store']);

    Route::apiResource('room-reports', RoomReportController::class)->except(['store']);
    Route::get('/programs/{program}/room-reports', [RoomReportController::class, 'listByProgram']);
    Route::get('/subjects/{subject}/room-reports', [RoomReportController::class, 'listBySubject']);
    Route::post('/students/{student}/room-reports', [RoomReportController::class, 'store']);

    Route::apiResource('skill-programs', SkillProgramController::class)->except(['store']);
    Route::get('/programs/{program}/skill-programs', [SkillProgramController::class, 'listByProgram']);
    Route::get('/programs/{program}/skill-programs/{semester}', [SkillProgramController::class, 'listBySemester']);
    Route::post('/students/{student}/skill-programs', [SkillProgramController::class, 'store']);

    // Bridges Paths
    Route::apiResource('bridges', BridgreController::class)->except(['store']);
    Route::get('/programs/{program}/bridges', [BridgreController::class, 'listByProgram']);
    Route::get('/subjects/{subject}/bridges', [BridgreController::class, 'listBySubject']);
    Route::post('/subjects/{subject}/bridges', [BridgreController::class, 'store']);
});
