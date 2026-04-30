<?php

use App\Models\Institution;
use App\Models\Program;
use App\Models\RoomReport;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutMiddleware(ValidateCsrfToken::class);
});

function roomReportSpaHeaders(): array
{
    $origin = config('app.frontend_url');

    return [
        'Origin' => $origin,
        'Referer' => rtrim($origin, '/').'/',
        'Accept' => 'application/json',
    ];
}

test('room report store accepts maintained register and defaults student attendance when omitted', function () {
    $user = User::factory()->create([
        'email' => 'room-report@example.com',
        'password' => 'password123',
    ]);

    $institution = Institution::factory()->create();
    $user->institutions()->attach($institution->id, ['role' => 'principal']);

    $program = Program::factory()->create([
        'institution_id' => $institution->id,
    ]);

    $subject = Subject::query()->create([
        'name' => 'Networks',
        'short_name' => 'CN',
        'type' => 'theory',
        'semester' => 3,
        'scheme' => 'C25',
        'institution_id' => $institution->id,
        'program_id' => $program->id,
    ]);

    $this->withCredentials();
    $this->postJson('/api/login', [
        'email' => 'room-report@example.com',
        'password' => 'password123',
    ], roomReportSpaHeaders())->assertOk();
    Auth::forgetGuards();
    $this->withCredentials();

    $payload = [
        'program_id' => $program->id,
        'subject_id' => $subject->id,
        'room_number' => 'A-101',
        'semester' => 3,
        'strength' => 40,
        'present' => 38,
        'attendance_register' => 'maintained',
        'topic_planned' => 'Layering',
        'topic_taught' => 'Layering',
        'pedagogy_used' => 'Lecture',
        'aids_used' => 'PPT',
        'teaching_skill' => 'satisfactory',
        'interaction' => 'good',
        'learning_outcome' => 'achieved',
        'valuation' => 'done',
        'principal_remarks' => 'OK',
        'report_date' => '2026-04-15',
    ];

    $response = $this->postJson('/api/room-reports', $payload, roomReportSpaHeaders());

    $response->assertCreated();

    $createdId = $response->json('data.id');
    expect($createdId)->not->toBeNull();

    $row = RoomReport::query()->whereKey($createdId)->firstOrFail();
    expect($row->attendance_register)->toBe('maintained');
    expect($row->student_attendance)->toBe('present');
    expect($row->learning_outcome)->toBe('achieved');
});
