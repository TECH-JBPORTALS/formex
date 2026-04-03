<?php

use App\Models\Institution;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutMiddleware(ValidateCsrfToken::class);
});

function programSpaHeaders(): array
{
    $origin = config('app.frontend_url');

    return [
        'Origin' => $origin,
        'Referer' => rtrim($origin, '/').'/',
        'Accept' => 'application/json',
    ];
}

test('programs crud uses session institution without institution id in path', function () {
    $user = User::factory()->create([
        'email' => 'prog@example.com',
        'password' => 'password123',
    ]);

    $institution = Institution::factory()->create();
    $user->institutions()->attach($institution->id);

    $this->withCredentials();

    $this->postJson('/api/login', [
        'email' => 'prog@example.com',
        'password' => 'password123',
    ], programSpaHeaders())
        ->assertOk();

    Auth::forgetGuards();

    $this->withCredentials();

    $this->getJson('/api/programs', programSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data', []);

    $this->postJson('/api/programs', [
        'name' => 'Diploma Computer',
        'short_name' => 'DCM',
        'intake' => 60,
    ], programSpaHeaders())
        ->assertCreated()
        ->assertJsonPath('data.name', 'Diploma Computer');

    $programId = Program::query()->where('institution_id', $institution->id)->firstOrFail()->id;

    $this->getJson('/api/programs/'.$programId, programSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.short_name', 'DCM');

    $this->putJson('/api/programs/'.$programId, [
        'short_name' => 'DC',
        'intake' => 120,
    ], programSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.intake', 120)
        ->assertJsonPath('data.short_name', 'DC');

    $this->deleteJson('/api/programs/'.$programId, [], programSpaHeaders())
        ->assertOk();

    expect(Program::query()->whereKey($programId)->exists())->toBeFalse();
});

test('programs are scoped to current institution when switching session', function () {
    $user = User::factory()->create([
        'email' => 'two@example.com',
        'password' => 'password123',
    ]);

    $a = Institution::factory()->create(['name' => 'College A']);
    $b = Institution::factory()->create(['name' => 'College B']);
    $user->institutions()->attach([$a->id, $b->id]);

    Program::factory()->create([
        'institution_id' => $a->id,
        'name' => 'From A',
        'short_name' => 'A1',
        'intake' => 30,
    ]);

    Program::factory()->create([
        'institution_id' => $b->id,
        'name' => 'From B',
        'short_name' => 'B1',
        'intake' => 40,
    ]);

    $this->withCredentials();

    $this->postJson('/api/login', [
        'email' => 'two@example.com',
        'password' => 'password123',
    ], programSpaHeaders())
        ->assertOk();

    Auth::forgetGuards();

    $this->withCredentials();

    $this->postJson('/api/user/current-institution', [
        'institution_id' => $a->id,
    ], programSpaHeaders())
        ->assertOk();

    $this->getJson('/api/programs', programSpaHeaders())
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'From A');
});

test('cannot show program from another institution', function () {
    $user = User::factory()->create([
        'email' => 'iso@example.com',
        'password' => 'password123',
    ]);

    $mine = Institution::factory()->create();
    $other = Institution::factory()->create();
    $user->institutions()->attach($mine->id);

    $foreign = Program::factory()->create([
        'institution_id' => $other->id,
    ]);

    $this->withCredentials();

    $this->postJson('/api/login', [
        'email' => 'iso@example.com',
        'password' => 'password123',
    ], programSpaHeaders())
        ->assertOk();

    Auth::forgetGuards();

    $this->withCredentials();

    $this->getJson('/api/programs/'.$foreign->id, programSpaHeaders())
        ->assertNotFound();
});
