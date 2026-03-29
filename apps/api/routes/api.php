<?php

use App\Http\Controllers\InstitutionController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SubjectController;
use Illuminate\Support\Facades\Route;

Route::apiResource('institutions', InstitutionController::class);
Route::apiResource('institutions.programs', ProgramController::class);
Route::apiResource('institutions.programs.students', StudentController::class);
Route::apiResource('institutions.programs.subjects', SubjectController::class);