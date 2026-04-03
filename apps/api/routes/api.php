<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContextProgramController;
use App\Http\Controllers\InstitutionController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\InternshipController;
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

    Route::apiResource('institutions.programs.students', StudentController::class)->scoped();

    Route::apiResource('institutions.programs.subjects', SubjectController::class)->scoped();

    Route::get('/internships/{internship}', [InternshipController::class, 'show']);
    Route::put('/internships/{internship}', [InternshipController::class, 'update']);
    Route::delete('/internships/{internship}', [InternshipController::class, 'destroy']);
    Route::get('/institutions/{institution}/internships', [InternshipController::class, 'listByInstitution']);
    Route::get('/programs/{program}/internships', [InternshipController::class, 'listByProgram']);
    Route::get('/students/{student}/internships', [InternshipController::class, 'listByStudent']);
    Route::post('/students/{student}/internships', [InternshipController::class, 'store']);
});

