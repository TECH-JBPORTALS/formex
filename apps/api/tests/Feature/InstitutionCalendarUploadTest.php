<?php

use App\Models\Institution;
use App\Models\InstitutionCalendarUpload;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->withoutMiddleware(ValidateCsrfToken::class);
    Storage::fake('local');
});

function calendarSpaHeaders(): array
{
    $origin = config('app.frontend_url');

    return [
        'Origin' => $origin,
        'Referer' => rtrim($origin, '/').'/',
        'Accept' => 'application/json',
    ];
}

function loginPrincipal($test, User $user): void
{
    $test->withCredentials();
    $test->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'password123',
    ], calendarSpaHeaders())->assertOk();

    Auth::forgetGuards();
    $test->withCredentials();
}

test('principal can upload list download and remove calendar file', function (): void {
    $user = User::factory()->create([
        'email' => 'cal-principal@example.com',
        'password' => 'password123',
    ]);
    $institution = Institution::factory()->create();
    $user->institutions()->attach($institution->id, ['role' => 'principal']);

    loginPrincipal($this, $user);

    $this->postJson('/api/user/current-institution', [
        'institution_id' => $institution->id,
    ], calendarSpaHeaders())->assertOk();

    $this->post('/api/institution/calendar-uploads', [
        'kind' => 'dcet_events',
        'file' => UploadedFile::fake()->create('events.pdf', 120, 'application/pdf'),
    ], calendarSpaHeaders())->assertCreated();

    $this->getJson('/api/institution/calendar-uploads', calendarSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.dcet_events.original_filename', 'events.pdf');

    $this->get('/api/institution/calendar-uploads/dcet_events/file', calendarSpaHeaders())
        ->assertOk();

    $this->deleteJson('/api/institution/calendar-uploads/dcet_events', [], calendarSpaHeaders())
        ->assertOk();

    expect(InstitutionCalendarUpload::query()->count())->toBe(0);
});
