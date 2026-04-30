<?php

use App\Models\Institution;
use App\Models\Program;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->withoutMiddleware(ValidateCsrfToken::class);
});

function facultySpaHeaders(): array
{
    $origin = config('app.frontend_url');

    return [
        'Origin' => $origin,
        'Referer' => rtrim($origin, '/').'/',
        'Accept' => 'application/json',
    ];
}

function facultyLogin($test, User $user): void
{
    $test->withCredentials();

    $test->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'password123',
    ], facultySpaHeaders())->assertOk();

    Auth::forgetGuards();
    $test->withCredentials();
}

test('principal can assign program coordinator with multiple branches and optional subjects', function (): void {
    $principal = User::factory()->create([
        'email' => 'principal-faculty@example.com',
        'password' => 'password123',
    ]);
    $faculty = User::factory()->create();
    $institution = Institution::factory()->create();
    $principal->institutions()->attach($institution->id, ['role' => 'principal']);

    $programA = Program::factory()->create([
        'institution_id' => $institution->id,
    ]);
    $programB = Program::factory()->create([
        'institution_id' => $institution->id,
    ]);

    $subjectA = Subject::query()->create([
        'name' => 'Mathematics',
        'short_name' => 'MTH',
        'type' => 'theory',
        'semester' => 2,
        'scheme' => 'C25',
        'institution_id' => $institution->id,
        'program_id' => $programA->id,
    ]);
    $subjectB = Subject::query()->create([
        'name' => 'Chemistry',
        'short_name' => 'CHM',
        'type' => 'practical',
        'semester' => 3,
        'scheme' => 'C25',
        'institution_id' => $institution->id,
        'program_id' => $programB->id,
    ]);

    facultyLogin($this, $principal);

    $this->postJson('/api/user/current-institution', [
        'institution_id' => $institution->id,
    ], facultySpaHeaders())->assertOk();

    $this->postJson('/api/institutions/current/faculty', [
        'user_id' => $faculty->id,
        'role' => 'program_coordinator',
        'program_ids' => [$programA->id, $programB->id],
        'subject_ids' => [$subjectA->id, $subjectB->id],
    ], facultySpaHeaders())
        ->assertCreated()
        ->assertJsonPath('data.role', 'program_coordinator')
        ->assertJsonCount(2, 'data.programs')
        ->assertJsonCount(2, 'data.subjects');

    $this->assertDatabaseHas('institution_user', [
        'institution_id' => $institution->id,
        'user_id' => $faculty->id,
        'role' => 'program_coordinator',
    ]);

    $this->assertDatabaseHas('institution_user_program', [
        'institution_id' => $institution->id,
        'user_id' => $faculty->id,
        'program_id' => $programA->id,
    ]);
    $this->assertDatabaseHas('institution_user_program', [
        'institution_id' => $institution->id,
        'user_id' => $faculty->id,
        'program_id' => $programB->id,
    ]);
    $this->assertDatabaseHas('institution_user_subject', [
        'institution_id' => $institution->id,
        'user_id' => $faculty->id,
        'subject_id' => $subjectA->id,
    ]);
    $this->assertDatabaseHas('institution_user_subject', [
        'institution_id' => $institution->id,
        'user_id' => $faculty->id,
        'subject_id' => $subjectB->id,
    ]);
});

test('course coordinator must be assigned only to subjects and can manage multiple', function (): void {
    $principal = User::factory()->create([
        'email' => 'principal-course@example.com',
        'password' => 'password123',
    ]);
    $faculty = User::factory()->create();
    $institution = Institution::factory()->create();
    $principal->institutions()->attach($institution->id, ['role' => 'principal']);

    $programA = Program::factory()->create([
        'institution_id' => $institution->id,
    ]);
    $programB = Program::factory()->create([
        'institution_id' => $institution->id,
    ]);

    $subjectA = Subject::query()->create([
        'name' => 'Physics',
        'short_name' => 'PHY',
        'type' => 'theory',
        'semester' => 1,
        'scheme' => 'C25',
        'institution_id' => $institution->id,
        'program_id' => $programA->id,
    ]);
    $subjectB = Subject::query()->create([
        'name' => 'Biology',
        'short_name' => 'BIO',
        'type' => 'practical',
        'semester' => 4,
        'scheme' => 'C25',
        'institution_id' => $institution->id,
        'program_id' => $programB->id,
    ]);

    facultyLogin($this, $principal);

    $this->postJson('/api/user/current-institution', [
        'institution_id' => $institution->id,
    ], facultySpaHeaders())->assertOk();

    $this->postJson('/api/institutions/current/faculty', [
        'user_id' => $faculty->id,
        'role' => 'course_coordinator',
        'subject_ids' => [$subjectA->id, $subjectB->id],
    ], facultySpaHeaders())
        ->assertCreated()
        ->assertJsonPath('data.role', 'course_coordinator')
        ->assertJsonCount(0, 'data.programs')
        ->assertJsonCount(2, 'data.subjects');

    $this->postJson('/api/institutions/current/faculty', [
        'user_id' => $faculty->id,
        'role' => 'course_coordinator',
        'program_ids' => [$programA->id],
        'subject_ids' => [$subjectA->id],
    ], facultySpaHeaders())
        ->assertUnprocessable()
        ->assertJsonPath('errors.program_ids.0', 'Course coordinator can only be assigned to subjects.');
});

test('program coordinator subjects must belong to assigned programs', function (): void {
    $principal = User::factory()->create([
        'email' => 'principal-branch-check@example.com',
        'password' => 'password123',
    ]);
    $faculty = User::factory()->create();
    $institution = Institution::factory()->create();
    $principal->institutions()->attach($institution->id, ['role' => 'principal']);

    $programA = Program::factory()->create([
        'institution_id' => $institution->id,
    ]);
    $programB = Program::factory()->create([
        'institution_id' => $institution->id,
    ]);

    $subjectInProgramB = Subject::query()->create([
        'name' => 'Mechanics',
        'short_name' => 'MEC',
        'type' => 'theory',
        'semester' => 3,
        'scheme' => 'C25',
        'institution_id' => $institution->id,
        'program_id' => $programB->id,
    ]);

    facultyLogin($this, $principal);

    $this->postJson('/api/user/current-institution', [
        'institution_id' => $institution->id,
    ], facultySpaHeaders())->assertOk();

    $this->postJson('/api/institutions/current/faculty', [
        'user_id' => $faculty->id,
        'role' => 'program_coordinator',
        'program_ids' => [$programA->id],
        'subject_ids' => [$subjectInProgramB->id],
    ], facultySpaHeaders())
        ->assertUnprocessable()
        ->assertJsonPath('errors.subject_ids.0', 'Selected subjects must belong to assigned programs for program coordinator.');
});

test('only principal can access faculty management routes', function (): void {
    $coordinator = User::factory()->create([
        'email' => 'coordinator@example.com',
        'password' => 'password123',
    ]);
    $institution = Institution::factory()->create();
    $coordinator->institutions()->attach($institution->id, ['role' => 'course_coordinator']);

    facultyLogin($this, $coordinator);

    $this->postJson('/api/user/current-institution', [
        'institution_id' => $institution->id,
    ], facultySpaHeaders())->assertOk();

    $this->getJson('/api/institutions/current/faculty', facultySpaHeaders())
        ->assertForbidden();
});

test('removing faculty is soft delete and faculty can be reactivated', function (): void {
    $principal = User::factory()->create([
        'email' => 'principal-soft-delete@example.com',
        'password' => 'password123',
    ]);
    $faculty = User::factory()->create();
    $institution = Institution::factory()->create();
    $principal->institutions()->attach($institution->id, ['role' => 'principal']);

    $program = Program::factory()->create([
        'institution_id' => $institution->id,
    ]);
    $subject = Subject::query()->create([
        'name' => 'Soft Delete Subject',
        'short_name' => 'SDS',
        'type' => 'theory',
        'semester' => 2,
        'scheme' => 'C25',
        'institution_id' => $institution->id,
        'program_id' => $program->id,
    ]);

    facultyLogin($this, $principal);

    $this->postJson('/api/user/current-institution', [
        'institution_id' => $institution->id,
    ], facultySpaHeaders())->assertOk();

    $this->postJson('/api/institutions/current/faculty', [
        'user_id' => $faculty->id,
        'role' => 'course_coordinator',
        'subject_ids' => [$subject->id],
    ], facultySpaHeaders())->assertCreated();

    $this->deleteJson("/api/institutions/current/faculty/{$faculty->id}", [], facultySpaHeaders())
        ->assertOk()
        ->assertJsonPath('message', 'Faculty removed successfully.');

    $this->assertDatabaseHas('institution_user', [
        'institution_id' => $institution->id,
        'user_id' => $faculty->id,
    ]);
    $this->assertDatabaseMissing('institution_user', [
        'institution_id' => $institution->id,
        'user_id' => $faculty->id,
        'deleted_at' => null,
    ]);

    $this->getJson('/api/institutions/current/faculty', facultySpaHeaders())
        ->assertOk()
        ->assertJsonFragment([
            'id' => $faculty->id,
            'is_active' => false,
        ]);

    $this->postJson('/api/institutions/current/faculty', [
        'user_id' => $faculty->id,
        'role' => 'course_coordinator',
        'subject_ids' => [$subject->id],
    ], facultySpaHeaders())
        ->assertCreated()
        ->assertJsonPath('data.id', $faculty->id)
        ->assertJsonPath('data.is_active', true);

    $this->assertDatabaseHas('institution_user', [
        'institution_id' => $institution->id,
        'user_id' => $faculty->id,
        'deleted_at' => null,
    ]);
});
