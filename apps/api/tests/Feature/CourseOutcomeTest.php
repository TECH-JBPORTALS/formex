<?php

use App\Models\CourseOutcome;
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

function courseOutcomeSpaHeaders(): array
{
    $origin = config('app.frontend_url');

    return [
        'Origin' => $origin,
        'Referer' => rtrim($origin, '/').'/',
        'Accept' => 'application/json',
    ];
}

test('course outcomes CRUD under /api/course-outcomes and /api/subjects/{subject}/course-outcomes', function () {
    $user = User::factory()->create([
        'email' => 'course-outcome-crud@example.com',
        'password' => 'password123',
    ]);
    $institution = Institution::factory()->create();
    $user->institutions()->attach($institution->id, ['role' => 'principal']);

    $program = Program::factory()->create([
        'institution_id' => $institution->id,
    ]);
    $subject = Subject::query()->create([
        'name' => 'Software Engineering',
        'short_name' => 'SE',
        'type' => 'theory',
        'semester' => 6,
        'scheme' => 'C25',
        'institution_id' => $institution->id,
        'program_id' => $program->id,
    ]);

    $this->withCredentials();
    $this->postJson('/api/login', [
        'email' => 'course-outcome-crud@example.com',
        'password' => 'password123',
    ], courseOutcomeSpaHeaders())->assertOk();
    Auth::forgetGuards();
    $this->withCredentials();

    $this->postJson("/api/subjects/{$subject->id}/course-outcomes", [
        'name' => 'Apply software engineering principles',
        'description' => 'Students apply engineering design in software lifecycle.',
        'syllabus_scheme' => 'C25',
        'target_percentage' => 65,
    ], courseOutcomeSpaHeaders())
        ->assertCreated()
        ->assertJsonPath('data.program_id', $program->id)
        ->assertJsonPath('data.course_id', $subject->id)
        ->assertJsonPath('data.target_percentage', 65);

    $created = CourseOutcome::query()
        ->where('course_id', $subject->id)
        ->where('name', 'Apply software engineering principles')
        ->firstOrFail();

    $this->getJson('/api/course-outcomes', courseOutcomeSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.0.id', $created->id);

    $this->getJson("/api/subjects/{$subject->id}/course-outcomes", courseOutcomeSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.0.id', $created->id);

    $this->putJson("/api/course-outcomes/{$created->id}", [
        'name' => 'Design and evaluate robust software systems',
        'description' => 'Students design, test and evaluate maintainable systems.',
        'syllabus_scheme' => 'R22',
        'target_percentage' => 70,
    ], courseOutcomeSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.name', 'Design and evaluate robust software systems')
        ->assertJsonPath('data.target_percentage', 70);

    $this->deleteJson("/api/course-outcomes/{$created->id}", [], courseOutcomeSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.id', $created->id);

    expect(CourseOutcome::query()->whereKey($created->id)->exists())->toBeFalse();
});
