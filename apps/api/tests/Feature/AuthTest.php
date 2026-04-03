<?php

use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutMiddleware(ValidateCsrfToken::class);
});

function spaHeaders(): array
{
    $origin = config('app.frontend_url');

    return [
        'Origin' => $origin,
        'Referer' => rtrim($origin, '/').'/',
    ];
}

test('register creates user and session', function () {
    $this->withCredentials();

    $this->postJson('/api/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ], spaHeaders())
        ->assertCreated();

    expect(User::where('email', 'test@example.com')->exists())->toBeTrue();

    Auth::forgetGuards();

    $this->withCredentials();
    $this->getJson('/api/user', spaHeaders())
        ->assertOk()
        ->assertJsonPath('user.email', 'test@example.com');
});

test('register rejects duplicate email', function () {
    User::factory()->create(['email' => 'taken@example.com']);

    $this->withCredentials();

    $this->postJson('/api/register', [
        'name' => 'Other',
        'email' => 'taken@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ], spaHeaders())
        ->assertUnprocessable();
});

test('login returns user and establishes session', function () {
    User::factory()->create([
        'email' => 'login@example.com',
        'password' => 'secretpass',
    ]);

    $this->withCredentials();

    $this->postJson('/api/login', [
        'email' => 'login@example.com',
        'password' => 'secretpass',
    ], spaHeaders())
        ->assertOk()
        ->assertJsonPath('two_factor', false);

    Auth::forgetGuards();

    $this->withCredentials();
    $this->getJson('/api/user', spaHeaders())
        ->assertOk()
        ->assertJsonPath('user.email', 'login@example.com');
});

test('login rejects invalid credentials', function () {
    User::factory()->create([
        'email' => 'login@example.com',
        'password' => 'correct',
    ]);

    $this->withCredentials();

    $this->postJson('/api/login', [
        'email' => 'login@example.com',
        'password' => 'wrong-password',
    ], spaHeaders())
        ->assertUnprocessable();
});

test('logout ends session', function () {
    $user = User::factory()->create([
        'email' => 'logout@example.com',
        'password' => 'secretpass',
    ]);

    $this->withCredentials();

    $this->postJson('/api/login', [
        'email' => 'logout@example.com',
        'password' => 'secretpass',
    ], spaHeaders())->assertOk();

    Auth::forgetGuards();

    $this->withCredentials();
    $this->postJson('/api/logout', [], spaHeaders())->assertNoContent();

    Auth::forgetGuards();

    $this->withCredentials();
    $this->getJson('/api/user', spaHeaders())->assertUnauthorized();
});
