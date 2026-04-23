<?php

use App\Models\Institution;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutMiddleware(ValidateCsrfToken::class);
});

function successIndexSpaHeaders(): array
{
    $origin = config('app.frontend_url');

    return [
        'Origin' => $origin,
        'Referer' => rtrim($origin, '/').'/',
        'Accept' => 'application/json',
    ];
}

test('program success index stores academic year wise totals and computes table', function () {
    $user = User::factory()->create([
        'email' => 'program-success-index@example.com',
        'password' => 'password123',
    ]);

    $institution = Institution::factory()->create();
    $user->institutions()->attach($institution->id, ['role' => 'principal']);

    $program = Program::factory()->create([
        'institution_id' => $institution->id,
    ]);

    $this->withCredentials();
    $this->postJson('/api/login', [
        'email' => 'program-success-index@example.com',
        'password' => 'password123',
    ], successIndexSpaHeaders())->assertOk();
    $this->withCredentials();

    $this->putJson("/api/programs/{$program->id}/success-index", [
        'rows' => [
            [
                'academic_year' => 2026,
                'admitted_count' => 100,
                'passed_without_backlog_count' => 80,
            ],
            [
                'academic_year' => 2025,
                'admitted_count' => 90,
                'passed_without_backlog_count' => 72,
            ],
            [
                'academic_year' => 2024,
                'admitted_count' => 85,
                'passed_without_backlog_count' => 68,
            ],
        ],
    ], successIndexSpaHeaders())->assertOk();

    $this->getJson("/api/programs/{$program->id}/success-index?academic_year=2026", successIndexSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.lyg.academic_year', 2026)
        ->assertJsonPath('data.lyg.admitted_count', 100)
        ->assertJsonPath('data.lyg.passed_without_backlog_count', 80)
        ->assertJsonPath('data.lyg.success_index', 0.8)
        ->assertJsonPath('data.lyg_m1.academic_year', 2025)
        ->assertJsonPath('data.lyg_m1.admitted_count', 90)
        ->assertJsonPath('data.lyg_m1.passed_without_backlog_count', 72)
        ->assertJsonPath('data.lyg_m1.success_index', 0.8)
        ->assertJsonPath('data.lyg_m2.academic_year', 2024)
        ->assertJsonPath('data.lyg_m2.admitted_count', 85)
        ->assertJsonPath('data.lyg_m2.passed_without_backlog_count', 68)
        ->assertJsonPath('data.lyg_m2.success_index', 0.8)
        ->assertJsonPath('data.average_success_index', 0.8);

    $this->getJson("/api/programs/{$program->id}/success-index-rows", successIndexSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.0.academic_year', 2026)
        ->assertJsonPath('data.0.admitted_count', 100)
        ->assertJsonPath('data.0.passed_without_backlog_count', 80)
        ->assertJsonPath('data.0.backlog_count', 20)
        ->assertJsonPath('data.1.academic_year', 2025)
        ->assertJsonPath('data.1.backlog_count', 18)
        ->assertJsonPath('data.2.academic_year', 2024)
        ->assertJsonPath('data.2.backlog_count', 17);
});
