<?php

use App\Models\CourseOutcome;
use App\Models\Institution;
use App\Models\Program;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Test;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutMiddleware(ValidateCsrfToken::class);
});

function testStudentMarkSpaHeaders(): array
{
    $origin = config('app.frontend_url');

    return [
        'Origin' => $origin,
        'Referer' => rtrim($origin, '/').'/',
        'Accept' => 'application/json',
    ];
}

test('test marks matrix and upsert respect caps', function () {
    $user = User::factory()->create([
        'email' => 'test-student-marks@example.com',
        'password' => 'password123',
    ]);
    $institution = Institution::factory()->create();
    $user->institutions()->attach($institution->id, ['role' => 'principal']);
    $academicYear = (int) date('Y');

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
    $co = CourseOutcome::query()->create([
        'institution_id' => $institution->id,
        'program_id' => $program->id,
        'course_id' => $subject->id,
        'type' => 'course_outcome',
        'name' => 'CO1',
        'description' => null,
        'syllabus_scheme' => 'C25',
        'target_percentage' => 70,
        'academic_year' => $academicYear,
    ]);
    $student = Student::query()->create([
        'full_name' => 'Alpha Student',
        'institution_id' => $institution->id,
        'program_id' => $program->id,
        'semester' => 3,
        'academic_year' => $academicYear,
        'register_no' => 'REG1',
    ]);

    $test = Test::query()->create([
        'institution_id' => $institution->id,
        'program_id' => $program->id,
        'subject_id' => $subject->id,
        'semester' => 3,
        'name' => 'Test 1',
        'cie_number' => 1,
        'maximum_marks' => 30,
        'minimum_passing_marks' => 10,
        'academic_year' => $academicYear,
    ]);
    $test->courseOutcomeMarks()->create([
        'course_outcome_id' => $co->id,
        'assigned_marks' => 20,
    ]);
    Test::query()->create([
        'institution_id' => $institution->id,
        'program_id' => $program->id,
        'subject_id' => $subject->id,
        'semester' => 3,
        'name' => 'Test 2',
        'cie_number' => 2,
        'maximum_marks' => 30,
        'minimum_passing_marks' => 10,
        'academic_year' => $academicYear,
    ]);

    $this->withCredentials();
    $this->postJson('/api/login', [
        'email' => 'test-student-marks@example.com',
        'password' => 'password123',
    ], testStudentMarkSpaHeaders())->assertSuccessful();
    Auth::forgetGuards();
    $this->withCredentials();

    $this->getJson(
        "/api/programs/{$program->id}/test-marks-matrix?semester=3&subject_id={$subject->id}",
        testStudentMarkSpaHeaders()
    )
        ->assertSuccessful()
        ->assertJsonPath('data.subject.id', $subject->id)
        ->assertJsonPath('data.students.0.id', $student->id)
        ->assertJsonPath('data.outcome_blocks.0.course_outcome.id', $co->id)
        ->assertJsonPath('data.outcome_blocks.0.cie_columns.0.max_marks', 20)
        ->assertJsonPath('data.outcome_blocks.0.cie_columns.1.test.name', 'Test 2')
        ->assertJsonPath('data.outcome_blocks.0.cie_columns.1.max_marks', 0)
        ->assertJsonPath('data.outcome_blocks.0.target_percentage', 70)
        ->assertJsonPath('data.outcome_blocks.0.target_marks', 14)
        ->assertJsonPath('data.outcome_blocks.0.total_obtained_by_student.'.$student->id, 0)
        ->assertJsonPath('data.outcome_blocks.0.target_achieved_by_student.'.$student->id, 'N')
        ->assertJsonPath('data.outcome_blocks.0.cie_columns.0.marks_by_student.'.$student->id, null);

    $this->putJson("/api/programs/{$program->id}/test-marks", [
        'semester' => 3,
        'subject_id' => $subject->id,
        'rows' => [
            [
                'student_id' => $student->id,
                'test_id' => $test->id,
                'course_outcome_id' => $co->id,
                'marks' => 15,
            ],
        ],
    ], testStudentMarkSpaHeaders())
        ->assertSuccessful()
        ->assertJsonPath('data.outcome_blocks.0.total_obtained_by_student.'.$student->id, 15)
        ->assertJsonPath('data.outcome_blocks.0.target_achieved_by_student.'.$student->id, 'Yes')
        ->assertJsonPath('data.outcome_blocks.0.cie_columns.0.marks_by_student.'.$student->id, 15);
});

test('test marks matrix lists all current-year program students even if student semester differs from subject', function () {
    $user = User::factory()->create([
        'email' => 'test-student-marks-2@example.com',
        'password' => 'password123',
    ]);
    $institution = Institution::factory()->create();
    $user->institutions()->attach($institution->id, ['role' => 'principal']);
    $academicYear = (int) date('Y');

    $program = Program::factory()->create([
        'institution_id' => $institution->id,
    ]);
    $subject = Subject::query()->create([
        'name' => 'Algorithms',
        'short_name' => 'ALG',
        'code' => 'CS301',
        'type' => 'theory',
        'semester' => 3,
        'scheme' => 'C25',
        'institution_id' => $institution->id,
        'program_id' => $program->id,
    ]);
    $co = CourseOutcome::query()->create([
        'institution_id' => $institution->id,
        'program_id' => $program->id,
        'course_id' => $subject->id,
        'type' => 'course_outcome',
        'name' => 'CO1',
        'description' => null,
        'syllabus_scheme' => 'C25',
        'target_percentage' => 60,
        'academic_year' => $academicYear,
    ]);
    $sameSem = Student::query()->create([
        'full_name' => 'Sem Three',
        'institution_id' => $institution->id,
        'program_id' => $program->id,
        'semester' => 3,
        'academic_year' => $academicYear,
        'register_no' => 'R3',
    ]);
    $otherSem = Student::query()->create([
        'full_name' => 'Sem One',
        'institution_id' => $institution->id,
        'program_id' => $program->id,
        'semester' => 1,
        'academic_year' => $academicYear,
        'register_no' => 'R1',
    ]);

    $test = Test::query()->create([
        'institution_id' => $institution->id,
        'program_id' => $program->id,
        'subject_id' => $subject->id,
        'semester' => 3,
        'name' => 'CIE1',
        'cie_number' => 1,
        'maximum_marks' => 30,
        'minimum_passing_marks' => 10,
        'academic_year' => $academicYear,
    ]);
    $test->courseOutcomeMarks()->create([
        'course_outcome_id' => $co->id,
        'assigned_marks' => 20,
    ]);

    $this->withCredentials();
    $this->postJson('/api/login', [
        'email' => 'test-student-marks-2@example.com',
        'password' => 'password123',
    ], testStudentMarkSpaHeaders())->assertSuccessful();
    Auth::forgetGuards();
    $this->withCredentials();

    $res = $this->getJson(
        "/api/programs/{$program->id}/test-marks-matrix?semester=3&subject_id={$subject->id}",
        testStudentMarkSpaHeaders()
    );
    $res->assertSuccessful();
    $ids = collect($res->json('data.students'))->pluck('id')->all();
    expect($ids)->toContain($sameSem->id, $otherSem->id);
});
