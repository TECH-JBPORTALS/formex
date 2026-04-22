<?php

use App\Models\Institution;
use App\Models\Program;
use App\Models\Student;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutMiddleware(ValidateCsrfToken::class);
});

function resultAnalysisSpaHeaders(): array
{
    $origin = config('app.frontend_url');

    return [
        'Origin' => $origin,
        'Referer' => rtrim($origin, '/').'/',
        'Accept' => 'application/json',
    ];
}

test('result analysis create list show update and delete for subject', function () {
    $user = User::factory()->create([
        'email' => 'result-analysis@example.com',
        'password' => 'password123',
    ]);

    $institution = Institution::factory()->create();
    $user->institutions()->attach($institution->id, ['role' => 'principal']);

    $program = Program::factory()->create([
        'institution_id' => $institution->id,
    ]);

    $subject = Subject::query()->create([
        'name' => 'Signals',
        'short_name' => 'SIG301',
        'type' => 'theory',
        'semester' => 3,
        'scheme' => 'C25',
        'institution_id' => $institution->id,
        'program_id' => $program->id,
    ]);

    $student = Student::query()->create([
        'full_name' => 'Alice A',
        'institution_id' => $institution->id,
        'program_id' => $program->id,
        'semester' => 3,
        'academic_year' => (int) now()->year,
    ]);

    $this->withCredentials();
    $this->postJson('/api/login', [
        'email' => 'result-analysis@example.com',
        'password' => 'password123',
    ], resultAnalysisSpaHeaders())->assertOk();
    Auth::forgetGuards();
    $this->withCredentials();

    $this->postJson("/api/subjects/{$subject->id}/result-analyses", [
        'student_id' => $student->id,
        'scored_grade' => 'A+',
    ], resultAnalysisSpaHeaders())
        ->assertCreated()
        ->assertJsonPath('data.scored_grade', 'A+')
        ->assertJsonPath('data.course_id', $subject->id)
        ->assertJsonPath('data.student_id', $student->id);

    $this->postJson("/api/subjects/{$subject->id}/result-analyses", [
        'student_id' => $student->id,
        'scored_grade' => 'Z',
    ], resultAnalysisSpaHeaders())->assertStatus(422);

    $rowId = DB::table('result_analyses')
        ->where('course_id', $subject->id)
        ->where('student_id', $student->id)
        ->value('id');

    $this->getJson("/api/subjects/{$subject->id}/result-analyses", resultAnalysisSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.0.id', $rowId);

    $this->getJson("/api/result-analyses/{$rowId}", resultAnalysisSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.id', $rowId);

    $this->putJson("/api/result-analyses/{$rowId}", [
        'scored_grade' => 'AB',
    ], resultAnalysisSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.scored_grade', 'AB');

    $this->deleteJson("/api/result-analyses/{$rowId}", [], resultAnalysisSpaHeaders())
        ->assertOk();

    $this->getJson("/api/result-analyses/{$rowId}", resultAnalysisSpaHeaders())
        ->assertNotFound();
});
