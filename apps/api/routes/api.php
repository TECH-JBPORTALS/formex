<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContextProgramController;
use App\Http\Controllers\InstitutionController;
use App\Http\Controllers\ProgramController;
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
    Route::apiResource('programs', ContextProgramController::class);
    Route::apiResource('institutions', InstitutionController::class);
    Route::apiResource('institutions.programs', ProgramController::class)->scoped();
    Route::apiResource('institutions.programs.students', StudentController::class)->scoped();
    Route::apiResource('institutions.programs.subjects', SubjectController::class)->scoped();
});
