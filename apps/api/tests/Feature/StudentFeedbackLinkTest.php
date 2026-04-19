<?php

use App\Models\FeedbackQuestion;
use App\Models\Institution;
use App\Models\Program;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->withoutMiddleware(ValidateCsrfToken::class);
});

function feedbackSpaHeaders(): array
{
    $origin = config('app.frontend_url');

    return [
        'Origin' => $origin,
        'Referer' => rtrim($origin, '/').'/',
        'Accept' => 'application/json',
    ];
}

function loginFeedbackFaculty($test, User $faculty): void
{
    $test->withCredentials();
    $test->postJson('/api/login', [
        'email' => $faculty->email,
        'password' => 'password123',
    ], feedbackSpaHeaders())->assertOk();

    Auth::forgetGuards();
    $test->withCredentials();
}

test('student can submit feedback through unique link only once', function (): void {
    $faculty = User::factory()->create([
        'email' => 'feedback-faculty@example.com',
        'password' => 'password123',
    ]);
    $institution = Institution::factory()->create();
    $faculty->institutions()->attach($institution->id, ['role' => 'principal']);

    $program = Program::factory()->create([
        'institution_id' => $institution->id,
    ]);

    $student = Student::factory()->create([
        'institution_id' => $institution->id,
        'program_id' => $program->id,
        'semester' => 3,
        'academic_year' => now()->year,
        'register_no' => 'REG-2026-01',
        'date_of_birth' => '2005-03-12',
    ]);

    loginFeedbackFaculty($this, $faculty);

    $this->postJson('/api/user/current-institution', [
        'institution_id' => $institution->id,
    ], feedbackSpaHeaders())->assertOk();

    $this->postJson('/api/feedback/questions', [
        'question' => 'Teaching quality',
        'order_index' => 1,
    ], feedbackSpaHeaders())->assertCreated();
    $this->postJson('/api/feedback/questions', [
        'question' => 'Lab support',
        'order_index' => 2,
    ], feedbackSpaHeaders())->assertCreated();

    $createLinkResponse = $this->postJson('/api/feedback/links', [
        'course_id' => $program->id,
        'semester' => 3,
        'feedback_type' => 'mid',
    ], feedbackSpaHeaders())
        ->assertCreated();

    $linkUrl = $createLinkResponse->json('data.link');
    expect($linkUrl)->toBeString();

    parse_str(parse_url((string) $linkUrl, PHP_URL_QUERY) ?? '', $queryParams);
    $token = $queryParams['token'] ?? null;
    expect($token)->toBeString();

    $startResponse = $this->postJson('/api/student-feedback/links/'.$token.'/start', [
        'register_no' => $student->register_no,
        'date_of_birth' => '2005-03-12',
    ], feedbackSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.already_submitted', false);

    $questionIds = collect($startResponse->json('data.questions'))->pluck('id')->values();
    expect($questionIds)->toHaveCount(2);

    $this->postJson('/api/student-feedback/links/'.$token.'/submit', [
        'register_no' => $student->register_no,
        'date_of_birth' => '2005-03-12',
        'ratings' => $questionIds->map(fn ($questionId): array => [
            'question_id' => $questionId,
            'rating' => 4,
        ])->all(),
    ], feedbackSpaHeaders())
        ->assertCreated()
        ->assertJsonPath('message', 'Feedback submitted successfully.');

    $this->postJson('/api/student-feedback/links/'.$token.'/start', [
        'register_no' => $student->register_no,
        'date_of_birth' => '2005-03-12',
    ], feedbackSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.already_submitted', true)
        ->assertJsonCount(0, 'data.questions');

    $this->postJson('/api/student-feedback/links/'.$token.'/submit', [
        'register_no' => $student->register_no,
        'date_of_birth' => '2005-03-12',
        'ratings' => [
            [
                'question_id' => $questionIds->first(),
                'rating' => 5,
            ],
        ],
    ], feedbackSpaHeaders())
        ->assertUnprocessable()
        ->assertJsonPath('errors.feedback.0', 'Feedback already submitted for this link.');
});

test('faculty can list feedback links and scoped submissions for a subject', function (): void {
    $faculty = User::factory()->create([
        'email' => 'feedback-list@example.com',
        'password' => 'password123',
    ]);
    $institution = Institution::factory()->create();
    $faculty->institutions()->attach($institution->id, ['role' => 'course_coordinator']);

    $program = Program::factory()->create([
        'institution_id' => $institution->id,
    ]);

    $student = Student::factory()->create([
        'institution_id' => $institution->id,
        'program_id' => $program->id,
        'semester' => 2,
        'academic_year' => now()->year,
        'register_no' => 'REG-LIST-01',
        'date_of_birth' => '2003-06-01',
    ]);

    loginFeedbackFaculty($this, $faculty);
    $this->postJson('/api/user/current-institution', [
        'institution_id' => $institution->id,
    ], feedbackSpaHeaders())->assertOk();

    FeedbackQuestion::query()->create([
        'institution_id' => $institution->id,
        'question' => 'List test Q',
        'order_index' => 1,
    ]);

    $createLinkResponse = $this->postJson('/api/feedback/links', [
        'course_id' => $program->id,
        'semester' => 2,
        'feedback_type' => 'mid',
    ], feedbackSpaHeaders())->assertCreated();

    $feedbackLinkId = $createLinkResponse->json('data.id');
    $linkUrl = $createLinkResponse->json('data.link');
    parse_str(parse_url((string) $linkUrl, PHP_URL_QUERY) ?? '', $queryParams);
    $token = $queryParams['token'] ?? '';

    $linksList = $this->getJson('/api/feedback/links?course_id='.$program->id.'&semester=2', feedbackSpaHeaders())
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $feedbackLinkId)
        ->assertJsonPath('data.0.status', 'active');
    expect((string) $linksList->json('data.0.share_url'))->toContain('/feedback?token=');

    $this->getJson('/api/feedback/submissions?course_id='.$program->id.'&semester=2', feedbackSpaHeaders())
        ->assertOk()
        ->assertJsonCount(0, 'data');

    $questionId = FeedbackQuestion::query()->where('institution_id', $institution->id)->value('id');

    $this->postJson('/api/student-feedback/links/'.$token.'/submit', [
        'register_no' => $student->register_no,
        'date_of_birth' => '2003-06-01',
        'ratings' => [
            ['question_id' => $questionId, 'rating' => 5],
        ],
    ], feedbackSpaHeaders())->assertCreated();

    $submissionsList = $this->getJson('/api/feedback/submissions?course_id='.$program->id.'&semester=2', feedbackSpaHeaders())
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.feedback_link_id', $feedbackLinkId)
        ->assertJsonPath('data.0.student_id', $student->id)
        ->assertJsonPath('data.0.average_rating', 5)
        ->assertJsonPath('data.0.feedback_link_exists', true);
    expect((string) $submissionsList->json('data.0.share_url'))->toContain('/feedback?token=');

    $this->deleteJson('/api/feedback/links/'.$feedbackLinkId, [], feedbackSpaHeaders())
        ->assertOk()
        ->assertJsonPath('message', 'Feedback link deleted successfully.');

    $this->getJson('/api/feedback/submissions?course_id='.$program->id.'&semester=2', feedbackSpaHeaders())
        ->assertOk()
        ->assertJsonCount(0, 'data');

    $this->getJson('/api/feedback/links?course_id='.$program->id.'&semester=2', feedbackSpaHeaders())
        ->assertOk()
        ->assertJsonCount(0, 'data');
});

test('faculty can read and delete submitted feedback response', function (): void {
    $faculty = User::factory()->create([
        'email' => 'feedback-manage@example.com',
        'password' => 'password123',
    ]);
    $institution = Institution::factory()->create();
    $faculty->institutions()->attach($institution->id, ['role' => 'program_coordinator']);

    $program = Program::factory()->create([
        'institution_id' => $institution->id,
    ]);

    $student = Student::factory()->create([
        'institution_id' => $institution->id,
        'program_id' => $program->id,
        'semester' => 5,
        'academic_year' => now()->year,
        'register_no' => 'REG-2026-77',
        'date_of_birth' => '2004-01-22',
    ]);

    loginFeedbackFaculty($this, $faculty);
    $this->postJson('/api/user/current-institution', [
        'institution_id' => $institution->id,
    ], feedbackSpaHeaders())->assertOk();

    $questionA = FeedbackQuestion::query()->create([
        'institution_id' => $institution->id,
        'question' => 'Syllabus coverage',
        'order_index' => 1,
    ]);
    $questionB = FeedbackQuestion::query()->create([
        'institution_id' => $institution->id,
        'question' => 'Mentoring support',
        'order_index' => 2,
    ]);

    $createLinkResponse = $this->postJson('/api/feedback/links', [
        'course_id' => $program->id,
        'semester' => 5,
        'feedback_type' => 'end',
    ], feedbackSpaHeaders())->assertCreated();

    $feedbackLinkId = $createLinkResponse->json('data.id');
    $linkUrl = $createLinkResponse->json('data.link');
    parse_str(parse_url((string) $linkUrl, PHP_URL_QUERY) ?? '', $queryParams);
    $token = $queryParams['token'] ?? '';

    $this->postJson('/api/student-feedback/links/'.$token.'/submit', [
        'register_no' => $student->register_no,
        'date_of_birth' => '2004-01-22',
        'ratings' => [
            ['question_id' => $questionA->id, 'rating' => 5],
            ['question_id' => $questionB->id, 'rating' => 4],
        ],
    ], feedbackSpaHeaders())->assertCreated();

    $this->getJson('/api/feedback/links/'.$feedbackLinkId.'/responses', feedbackSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.responses.0.student_id', $student->id)
        ->assertJsonPath('data.responses.0.average_rating', 4.5);

    $this->deleteJson('/api/feedback/links/'.$feedbackLinkId.'/responses/'.$student->id, [], feedbackSpaHeaders())
        ->assertOk()
        ->assertJsonPath('message', 'Feedback response deleted successfully.');

    $this->getJson('/api/feedback/links/'.$feedbackLinkId.'/responses', feedbackSpaHeaders())
        ->assertOk()
        ->assertJsonCount(0, 'data.responses');
});

test('global feedback questions prevent duplicates and keep minimum one question', function (): void {
    $faculty = User::factory()->create([
        'email' => 'feedback-question-admin@example.com',
        'password' => 'password123',
    ]);
    $institution = Institution::factory()->create();
    $faculty->institutions()->attach($institution->id, ['role' => 'principal']);

    loginFeedbackFaculty($this, $faculty);
    $this->postJson('/api/user/current-institution', [
        'institution_id' => $institution->id,
    ], feedbackSpaHeaders())->assertOk();

    $questionA = $this->postJson('/api/feedback/questions', [
        'question' => 'Teaching quality',
    ], feedbackSpaHeaders())
        ->assertCreated()
        ->json('data.id');

    $this->postJson('/api/feedback/questions', [
        'question' => ' teaching quality ',
    ], feedbackSpaHeaders())
        ->assertUnprocessable()
        ->assertJsonPath('errors.question.0', 'This feedback question already exists.');

    $questionB = $this->postJson('/api/feedback/questions', [
        'question' => 'Industry relevance',
    ], feedbackSpaHeaders())
        ->assertCreated()
        ->json('data.id');

    $this->deleteJson('/api/feedback/questions/'.$questionA, [], feedbackSpaHeaders())
        ->assertOk()
        ->assertJsonPath('message', 'Feedback question deleted successfully.');

    $this->deleteJson('/api/feedback/questions/'.$questionB, [], feedbackSpaHeaders())
        ->assertUnprocessable()
        ->assertJsonPath('errors.question.0', 'At least one feedback question is required.');
});
