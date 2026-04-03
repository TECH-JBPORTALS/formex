<?php

use App\Models\Institution;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutMiddleware(ValidateCsrfToken::class);
});

function institutionSpaHeaders(): array
{
    $origin = config('app.frontend_url');

    return [
        'Origin' => $origin,
        'Referer' => rtrim($origin, '/').'/',
        'Accept' => 'application/json',
    ];
}

test('user payload includes institutions for onboarding', function () {
    $user = User::factory()->create([
        'email' => 'solo@example.com',
        'password' => 'password123',
    ]);

    $this->withCredentials();

    $this->postJson('/api/login', [
        'email' => 'solo@example.com',
        'password' => 'password123',
    ], institutionSpaHeaders())
        ->assertOk();

    Auth::forgetGuards();

    $this->withCredentials();
    $this->getJson('/api/user', institutionSpaHeaders())
        ->assertOk()
        ->assertJsonPath('user.email', 'solo@example.com')
        ->assertJsonPath('user.institutions', [])
        ->assertJsonPath('current_institution', null)
        ->assertJsonPath('current_institution_id', null);
});

test('creating institution attaches user and lists only their institutions', function () {
    $user = User::factory()->create([
        'email' => 'principal@example.com',
        'password' => 'password123',
    ]);

    $other = Institution::factory()->create();

    $this->withCredentials();

    $this->postJson('/api/login', [
        'email' => 'principal@example.com',
        'password' => 'password123',
    ], institutionSpaHeaders())
        ->assertOk();

    Auth::forgetGuards();

    $this->withCredentials();

    $this->postJson('/api/institutions', [
        'name' => 'Test College',
        'code' => 'TC001',
        'address' => '1 Campus Road',
        'type' => 'private',
    ], institutionSpaHeaders())
        ->assertCreated()
        ->assertJsonPath('data.name', 'Test College');

    Auth::forgetGuards();

    $this->withCredentials();

    $this->getJson('/api/user', institutionSpaHeaders())
        ->assertOk()
        ->assertJsonCount(1, 'user.institutions')
        ->assertJsonPath('current_institution.code', 'TC001')
        ->assertJson(fn (\Illuminate\Testing\Fluent\AssertableJson $json) => $json
            ->whereType('current_institution_id', 'string')
            ->etc());

    $this->getJson('/api/institutions', institutionSpaHeaders())
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.code', 'TC001');

    expect($user->fresh()->institutions()->pluck('id')->all())
        ->not->toContain($other->id);
});

test('user cannot access institution they do not belong to', function () {
    User::factory()->create([
        'email' => 'a@example.com',
        'password' => 'password123',
    ]);

    $institution = Institution::factory()->create();

    $this->withCredentials();

    $this->postJson('/api/login', [
        'email' => 'a@example.com',
        'password' => 'password123',
    ], institutionSpaHeaders())
        ->assertOk();

    Auth::forgetGuards();

    $this->withCredentials();

    $this->getJson('/api/institutions/'.$institution->id, institutionSpaHeaders())
        ->assertNotFound();
});

test('session defaults current institution to first by name and can be switched', function () {
    $user = User::factory()->create([
        'email' => 'multi@example.com',
        'password' => 'password123',
    ]);

    $zebra = Institution::factory()->create([
        'name' => 'Zebra Institute',
        'code' => 'ZEB',
    ]);
    $alpha = Institution::factory()->create([
        'name' => 'Alpha College',
        'code' => 'ALP',
    ]);
    $user->institutions()->attach([$zebra->id, $alpha->id]);

    $this->withCredentials();

    $this->postJson('/api/login', [
        'email' => 'multi@example.com',
        'password' => 'password123',
    ], institutionSpaHeaders())
        ->assertOk();

    Auth::forgetGuards();

    $this->withCredentials();

    $this->getJson('/api/user', institutionSpaHeaders())
        ->assertOk()
        ->assertJsonPath('current_institution.name', 'Alpha College');

    $this->postJson('/api/user/current-institution', [
        'institution_id' => $zebra->id,
    ], institutionSpaHeaders())
        ->assertOk()
        ->assertJsonPath('current_institution.name', 'Zebra Institute');

    Auth::forgetGuards();

    $this->withCredentials();

    $this->getJson('/api/user', institutionSpaHeaders())
        ->assertOk()
        ->assertJsonPath('current_institution.name', 'Zebra Institute');
});

test('set current institution rejects non-membership', function () {
    $user = User::factory()->create([
        'email' => 'u@example.com',
        'password' => 'password123',
    ]);

    $foreign = Institution::factory()->create();

    $this->withCredentials();

    $this->postJson('/api/login', [
        'email' => 'u@example.com',
        'password' => 'password123',
    ], institutionSpaHeaders())
        ->assertOk();

    Auth::forgetGuards();

    $this->withCredentials();

    $this->postJson('/api/user/current-institution', [
        'institution_id' => $foreign->id,
    ], institutionSpaHeaders())
        ->assertUnprocessable()
        ->assertJsonPath('errors.institution_id.0', 'You do not belong to this institution.');
});
