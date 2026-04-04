<?php

use App\Http\Controllers\HigherEducationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContextProgramController;
use App\Http\Controllers\InstitutionController;
use App\Http\Controllers\InternshipController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\PlacementController;
use Illuminate\Support\Facades\Route;

Route::middleware('web')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:web');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/user/current-institution', [AuthController::class, 'setCurrentInstitution']);
    Route::apiResource('institutions', InstitutionController::class);
    Route::apiResource('programs', ContextProgramController::class);

    Route::apiResource('programs.students', StudentController::class)->scoped();

    Route::apiResource('institutions.programs.subjects', SubjectController::class)->scoped();

    // Subjects Paths
    Route::apiResource('subjects', SubjectController::class)->except(['store']);
    Route::get('/programs/{program}/subjects', [SubjectController::class, 'listByProgram']);
    Route::get('/programs/{program}/subjects/{semester}', [SubjectController::class, 'listbysemester']);
    Route::post('/programs/{program}/subjects', [SubjectController::class, 'store']);

    // Internships Paths
    Route::apiResource('internships', InternshipController::class)->except(['store']);
    Route::get('/programs/{program}/internships', [InternshipController::class, 'listByProgram']);
    Route::get('/students/{student}/internships', [InternshipController::class, 'listByStudent']);
    Route::post('/students/{student}/internships', [InternshipController::class, 'store']);

    // Placements Paths
    Route::get('/institutions/{institution}/placements', [PlacementController::class, 'listByInstitution']);
    Route::get('/programs/{program}/placements', [PlacementController::class, 'listByProgram']);
    Route::get('/students/{student}/placements', [PlacementController::class, 'listByStudent']);
    Route::post('/students/{student}/placements', [PlacementController::class, 'store']);
    Route::get('/placements/{placement}', [PlacementController::class, 'show']);
    Route::put('/placements/{placement}', [PlacementController::class, 'update']);
    Route::delete('/placements/{placement}', [PlacementController::class, 'destroy']);

    // Higher Education Paths
    Route::post('/students/{student}/highereducations', [HigherEducationController::class, 'store']);
    Route::get('/students/{student}/highereducations', [HigherEducationController::class, 'listByStudent']);
    Route::get('/institutions/{institution}/highereducations', [HigherEducationController::class, 'listByInstitution']);
    Route::get('/programs/{program}/highereducations', [HigherEducationController::class, 'listByProgram']);
    Route::get('/highereducations/{highereducation}', [HigherEducationController::class, 'show']);
    Route::put('/highereducations/{highereducation}', [HigherEducationController::class, 'update']);
    Route::delete('/highereducations/{highereducation}', [HigherEducationController::class, 'destroy']);

});

