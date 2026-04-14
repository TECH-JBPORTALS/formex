<?php

use App\Models\Institution;
use App\Models\Program;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutMiddleware(ValidateCsrfToken::class);
});

function timetableSpaHeaders(): array
{
    $origin = config('app.frontend_url');

    return [
        'Origin' => $origin,
        'Referer' => rtrim($origin, '/').'/',
        'Accept' => 'application/json',
    ];
}

test('timetable slot can be saved and fetched by program and semester', function () {
    $user = User::factory()->create([
        'email' => 'timetable@example.com',
        'password' => 'password123',
    ]);
    $coordinator = User::factory()->create();

    $institution = Institution::factory()->create();
    $user->institutions()->attach($institution->id);
    $coordinator->institutions()->attach($institution->id);

    $program = Program::factory()->create([
        'institution_id' => $institution->id,
    ]);

    $subject = Subject::query()->create([
        'name' => 'Applied Mathematics',
        'short_name' => 'MATH101',
        'type' => 'theory',
        'semester' => 1,
        'scheme' => 'C25',
        'program_id' => $program->id,
        'institution_id' => $institution->id,
    ]);

    $this->withCredentials();
    $this->postJson('/api/login', [
        'email' => 'timetable@example.com',
        'password' => 'password123',
    ], timetableSpaHeaders())->assertOk();

    Auth::forgetGuards();

    $this->withCredentials();
    $this->putJson("/api/programs/{$program->id}/timetable", [
        'semester' => 1,
        'day' => 'Monday',
        'start_hour_no' => 1,
        'end_hour_no' => 2,
        'subjects' => [
            [
                'subject_id' => $subject->id,
                'course_coordinator_id' => $coordinator->id,
                'batch' => 'Batch A',
                'room_no' => 'A-204',
            ],
        ],
    ], timetableSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.day', 'Monday')
        ->assertJsonPath('data.subjects.0.subject_id', $subject->id);

    $this->getJson("/api/programs/{$program->id}/timetable?semester=1", timetableSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.slots.0.day', 'Monday')
        ->assertJsonPath('data.slots.0.subjects.0.subject_name', 'Applied Mathematics');

    $this->putJson("/api/programs/{$program->id}/timetable", [
        'semester' => 1,
        'day' => 'Tuesday',
        'start_hour_no' => 4,
        'end_hour_no' => 4,
        'subjects' => [
            [
                'subject_id' => $subject->id,
                'course_coordinator_id' => $coordinator->id,
                'batch' => 'Batch A',
                'room_no' => 'A-204',
            ],
        ],
    ], timetableSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.day', 'Tuesday')
        ->assertJsonPath('data.start_hour_no', 4)
        ->assertJsonPath('data.end_hour_no', 4);

    $this->putJson("/api/programs/{$program->id}/timetable", [
        'semester' => 1,
        'day' => 'Monday',
        'start_hour_no' => 2,
        'end_hour_no' => 3,
        'subjects' => [
            [
                'subject_id' => $subject->id,
                'course_coordinator_id' => $coordinator->id,
                'batch' => 'Batch A',
                'room_no' => 'A-204',
            ],
        ],
    ], timetableSpaHeaders())
        ->assertUnprocessable();
});

test('timetable endpoints are scoped to current institution', function () {
    $user = User::factory()->create([
        'email' => 'timetable-scope@example.com',
        'password' => 'password123',
    ]);

    $a = Institution::factory()->create(['name' => 'A Institute', 'code' => 'A']);
    $b = Institution::factory()->create(['name' => 'B Institute', 'code' => 'B']);
    $user->institutions()->attach([$a->id, $b->id]);

    $programB = Program::factory()->create([
        'institution_id' => $b->id,
    ]);

    $this->withCredentials();
    $this->postJson('/api/login', [
        'email' => 'timetable-scope@example.com',
        'password' => 'password123',
    ], timetableSpaHeaders())->assertOk();

    Auth::forgetGuards();
    $this->withCredentials();

    $this->postJson('/api/user/current-institution', [
        'institution_id' => $a->id,
    ], timetableSpaHeaders())->assertOk();

    $this->getJson("/api/programs/{$programB->id}/timetable?semester=1", timetableSpaHeaders())
        ->assertNotFound();
});
