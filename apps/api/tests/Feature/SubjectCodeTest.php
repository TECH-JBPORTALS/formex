<?php

use App\Models\Institution;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->withoutMiddleware(ValidateCsrfToken::class);
});

function subjectCodeSpaHeaders(): array
{
    $origin = config('app.frontend_url');

    return [
        'Origin' => $origin,
        'Referer' => rtrim($origin, '/').'/',
        'Accept' => 'application/json',
    ];
}

test('subject supports code on create update and list', function (): void {
    $user = User::factory()->create([
        'email' => 'subject-code@example.com',
        'password' => 'password123',
    ]);

    $institution = Institution::factory()->create();
    $user->institutions()->attach($institution->id, ['role' => 'principal']);

    $program = Program::factory()->create([
        'institution_id' => $institution->id,
    ]);

    $this->withCredentials();
    $this->postJson('/api/login', [
        'email' => 'subject-code@example.com',
        'password' => 'password123',
    ], subjectCodeSpaHeaders())->assertOk();
    Auth::forgetGuards();
    $this->withCredentials();

    $create = $this->postJson("/api/programs/{$program->id}/subjects", [
        'name' => 'Database Systems',
        'short_name' => 'DBMS',
        'code' => 'CS-401',
        'type' => 'theory',
        'semester' => 4,
        'scheme' => 'C25',
    ], subjectCodeSpaHeaders())
        ->assertCreated()
        ->assertJsonPath('data.code', 'CS-401');

    $subjectId = (string) $create->json('data.id');

    $this->putJson("/api/subjects/{$subjectId}", [
        'code' => 'CS-401A',
    ], subjectCodeSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.code', 'CS-401A');

    $this->getJson("/api/programs/{$program->id}/subjects/4", subjectCodeSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.0.code', 'CS-401A');
});
