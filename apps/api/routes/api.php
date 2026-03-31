<?php

use App\Http\Controllers\InstitutionController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\InternshipController;
use Illuminate\Support\Facades\Route;

Route::apiResource('institutions', InstitutionController::class);
Route::apiResource('institutions.programs', ProgramController::class);
Route::apiResource('institutions.programs.students', StudentController::class);
Route::apiResource('institutions.programs.subjects', SubjectController::class);
Route::get('/institutions/{institution}/internships', [InternshipController::class, 'listByInstitution']);
Route::get('/programs/{program}/internships', [InternshipController::class, 'listByProgram']);
Route::get('/students/{student}/internships', [InternshipController::class, 'listByStudent']);
Route::post('/students/{student}/internships', [InternshipController::class, 'store']);
Route::get('/internships/{internship}', [InternshipController::class, 'show']);
Route::put('/internships/{internship}', [InternshipController::class, 'update']);
Route::delete('/internships/{internship}', [InternshipController::class, 'destroy']);
