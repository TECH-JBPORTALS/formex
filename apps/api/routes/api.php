<?php

use App\Http\Controllers\HigherEducationController;
use App\Http\Controllers\InstitutionController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\InternshipController;
use App\Http\Controllers\PlacementController;
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


Route::get('/institutions/{institution}/placements', [PlacementController::class, 'listByInstitution']);
Route::get('/programs/{program}/placements', [PlacementController::class, 'listByProgram']);
Route::get('/students/{student}/placements', [PlacementController::class, 'listByStudent']);
Route::post('/students/{student}/placements', [PlacementController::class, 'store']);
Route::get('/placements/{placement}', [PlacementController::class, 'show']);
Route::put('/placements/{placement}', [PlacementController::class, 'update']);
Route::delete('/placements/{placement}', [PlacementController::class, 'destroy']);

Route::post('/students/{student}/highereducations', [HigherEducationController::class, 'store']);
Route::get('/students/{student}/highereducations', [HigherEducationController::class, 'listByStudent']);
Route::get('/institutions/{institution}/highereducations', [HigherEducationController::class, 'listByInstitution']);
Route::get('/programs/{program}/highereducations', [HigherEducationController::class, 'listByProgram']);
Route::get('/highereducations/{highereducation}', [HigherEducationController::class, 'show']);
Route::put('/highereducations/{highereducation}', [HigherEducationController::class, 'update']);
Route::delete('/highereducations/{highereducation}', [HigherEducationController::class, 'destroy']);

