<?php

use App\Models\Institution;
use App\Models\Program;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutMiddleware(ValidateCsrfToken::class);
});

function studentSpaHeaders(): array
{
    $origin = config('app.frontend_url');

    return [
        'Origin' => $origin,
        'Referer' => rtrim($origin, '/').'/',
        'Accept' => 'application/json',
    ];
}

test('students CRUD under /api/programs/{program}/students', function () {
    $user = User::factory()->create([
        'email' => 'student-crud@example.com',
        'password' => 'password123',
    ]);

    $institution = Institution::factory()->create();
    $user->institutions()->attach($institution->id);

    $program = Program::factory()->create([
        'institution_id' => $institution->id,
    ]);

    $existing = Student::factory()->create([
        'institution_id' => $institution->id,
        'program_id' => $program->id,
        'semester' => 1,
        'academic_year' => 2026,
        'full_name' => 'Existing Student',
    ]);

    $this->withCredentials();

    $this->postJson('/api/login', [
        'email' => 'student-crud@example.com',
        'password' => 'password123',
    ], studentSpaHeaders())->assertOk();

    Auth::forgetGuards();

    $this->withCredentials();

    $this->getJson("/api/programs/{$program->id}/students", studentSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.0.id', $existing->id);

    $this->postJson("/api/programs/{$program->id}/students", [
        'full_name' => 'New Student',
        'date_of_birth' => '2002-02-02',
        'semester' => 1,
        'academic_year' => 2027,
        'register_no' => 'RN-100',
        'email' => 'new@student.test',
    ], studentSpaHeaders())
        ->assertCreated()
        ->assertJsonPath('data.full_name', 'New Student')
        ->assertJsonPath('data.program_id', $program->id)
        ->assertJsonPath('data.institution_id', $institution->id);

    $created = Student::query()
        ->where('program_id', $program->id)
        ->where('full_name', 'New Student')
        ->firstOrFail();

    $this->putJson("/api/programs/{$program->id}/students/{$created->id}", [
        'full_name' => 'Updated Student',
        'semester' => 1,
        'academic_year' => 2028,
        'email' => 'updated@student.test',
    ], studentSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.full_name', 'Updated Student')
        ->assertJsonPath('data.academic_year', 2028);

    $this->deleteJson("/api/programs/{$program->id}/students/{$created->id}", [], studentSpaHeaders())
        ->assertOk()
        ->assertJsonPath('message', 'Student deleted successfully');

    expect(Student::query()->whereKey($created->id)->exists())->toBeFalse();
});

test('programs students are restricted to the current institution', function () {
    $user = User::factory()->create([
        'email' => 'student-scope@example.com',
        'password' => 'password123',
    ]);

    $a = Institution::factory()->create(['name' => 'A Institute', 'code' => 'A']);
    $b = Institution::factory()->create(['name' => 'B Institute', 'code' => 'B']);
    $user->institutions()->attach([$a->id, $b->id]);

    $programA = Program::factory()->create([
        'institution_id' => $a->id,
    ]);
    $programB = Program::factory()->create([
        'institution_id' => $b->id,
    ]);

    Student::factory()->create([
        'institution_id' => $b->id,
        'program_id' => $programB->id,
        'semester' => 1,
        'academic_year' => 2026,
    ]);

    $this->withCredentials();

    $this->postJson('/api/login', [
        'email' => 'student-scope@example.com',
        'password' => 'password123',
    ], studentSpaHeaders())->assertOk();

    Auth::forgetGuards();

    $this->withCredentials();

    $this->postJson('/api/user/current-institution', [
        'institution_id' => $a->id,
    ], studentSpaHeaders())->assertOk();

    $this->getJson("/api/programs/{$programB->id}/students", studentSpaHeaders())
        ->assertNotFound();

    // Sanity: listing for program in current institution still works.
    $this->getJson("/api/programs/{$programA->id}/students", studentSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data', []);
});
