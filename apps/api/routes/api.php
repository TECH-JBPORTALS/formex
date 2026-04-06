<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\HigherEducationController;
use App\Http\Controllers\InstitutionController;
use App\Http\Controllers\InternshipController;
use App\Http\Controllers\PlacementController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\RoomReportController;
use App\Http\Controllers\SkillProgramController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SubjectController;
use Illuminate\Support\Facades\Route;

Route::middleware('web')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:web');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/user/current-institution', [AuthController::class, 'setCurrentInstitution']);
    Route::post('/user/academic-year', [AuthController::class, 'setAcademicYear']);

    Route::apiResource('institutions', InstitutionController::class);

    Route::apiResource('programs', ProgramController::class);

    Route::apiResource('programs.students', StudentController::class);
    Route::get('/students', [StudentController::class, 'search']);

    Route::apiResource('subjects', SubjectController::class)->except(['store']);
    Route::get('/programs/{program}/subjects', [SubjectController::class, 'listByProgram']);
    Route::get('/programs/{program}/subjects/{semester}', [SubjectController::class, 'listbysemester']);
    Route::post('/programs/{program}/subjects', [SubjectController::class, 'store']);

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
});
