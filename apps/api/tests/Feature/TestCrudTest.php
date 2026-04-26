<?php

use App\Models\CourseOutcome;
use App\Models\Institution;
use App\Models\Program;
use App\Models\Subject;
use App\Models\Test as AcademicTest;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutMiddleware(ValidateCsrfToken::class);
});

function testsSpaHeaders(): array
{
    $origin = config('app.frontend_url');

    return [
        'Origin' => $origin,
        'Referer' => rtrim($origin, '/').'/',
        'Accept' => 'application/json',
    ];
}

test('tests CRUD works per semester with total assigned marks', function () {
    $user = User::factory()->create([
        'email' => 'tests-crud@example.com',
        'password' => 'password123',
    ]);
    $institution = Institution::factory()->create();
    $user->institutions()->attach($institution->id, ['role' => 'principal']);

    $program = Program::factory()->create([
        'institution_id' => $institution->id,
    ]);
    $subject = Subject::query()->create([
        'name' => 'Data Structures',
        'short_name' => 'DS',
        'code' => 'CS201',
        'type' => 'theory',
        'semester' => 3,
        'scheme' => 'C25',
        'institution_id' => $institution->id,
        'program_id' => $program->id,
    ]);
    $co1 = CourseOutcome::query()->create([
        'institution_id' => $institution->id,
        'program_id' => $program->id,
        'course_id' => $subject->id,
        'type' => 'course_outcome',
        'name' => 'CO1',
        'description' => 'Implement linear data structures.',
        'syllabus_scheme' => 'C25',
        'academic_year' => (int) date('Y'),
    ]);
    $co2 = CourseOutcome::query()->create([
        'institution_id' => $institution->id,
        'program_id' => $program->id,
        'course_id' => $subject->id,
        'type' => 'course_outcome',
        'name' => 'CO2',
        'description' => 'Analyze algorithm complexity.',
        'syllabus_scheme' => 'C25',
        'academic_year' => (int) date('Y'),
    ]);

    $this->withCredentials();
    $this->postJson('/api/login', [
        'email' => 'tests-crud@example.com',
        'password' => 'password123',
    ], testsSpaHeaders())->assertSuccessful();
    Auth::forgetGuards();
    $this->withCredentials();

    $storeResponse = $this->postJson("/api/programs/{$program->id}/tests", [
        'semester' => 3,
        'name' => 'Test 1',
        'cie_number' => 1,
        'maximum_marks' => 50,
        'minimum_passing_marks' => 20,
        'course_outcome_marks' => [
            [
                'course_outcome_id' => $co1->id,
                'assigned_marks' => 25,
            ],
            [
                'course_outcome_id' => $co2->id,
                'assigned_marks' => 20,
            ],
        ],
    ], testsSpaHeaders())
        ->assertCreated()
        ->assertJsonPath('data.total_assigned_marks', 45)
        ->assertJsonPath('data.name', 'Test 1')
        ->assertJsonPath('data.cie_number', 1);

    $testId = (string) $storeResponse->json('data.id');

    $this->getJson("/api/programs/{$program->id}/tests?semester=3", testsSpaHeaders())
        ->assertSuccessful()
        ->assertJsonPath('data.0.id', $testId)
        ->assertJsonPath('data.0.total_assigned_marks', 45);

    $this->putJson("/api/tests/{$testId}", [
        'semester' => 3,
        'name' => 'Test 2',
        'cie_number' => 2,
        'maximum_marks' => 60,
        'minimum_passing_marks' => 24,
        'course_outcome_marks' => [
            [
                'course_outcome_id' => $co1->id,
                'assigned_marks' => 30,
            ],
            [
                'course_outcome_id' => $co2->id,
                'assigned_marks' => 15,
            ],
        ],
    ], testsSpaHeaders())
        ->assertSuccessful()
        ->assertJsonPath('data.name', 'Test 2')
        ->assertJsonPath('data.cie_number', 2)
        ->assertJsonPath('data.total_assigned_marks', 45);

    $this->deleteJson("/api/tests/{$testId}", [], testsSpaHeaders())
        ->assertSuccessful()
        ->assertJsonPath('data.id', $testId);

    expect(AcademicTest::query()->whereKey($testId)->exists())->toBeFalse();
});
