<?php

namespace App\Http\Controllers;

use App\Http\Resources\FeedbackLinkSummaryResource;
use App\Http\Resources\StudentFeedbackFacultyIndexResource;
use App\Http\Resources\SubjectFeedbackScopeRowResource;
use App\Models\FeedbackLink;
use App\Models\FeedbackQuestion;
use App\Models\Program;
use App\Models\Student;
use App\Models\StudentFeedback;
use App\Support\CurrentInstitutionSession;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class StudentFeedbackController
{
    private const array FEEDBACK_TYPES = ['mid', 'end'];

    public function questionIndex(Request $request)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);

        $questions = FeedbackQuestion::query()
            ->where('institution_id', $institution->id)
            ->orderBy('order_index')
            ->get(['id', 'question', 'order_index']);

        return response()->json([
            'data' => $questions,
        ]);
    }

    public function questionStore(Request $request)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);

        $validated = $request->validate([
            'question' => ['required', 'string', 'max:2000'],
            'order_index' => ['nullable', 'integer', 'min:1', 'max:1000'],
        ]);

        $normalizedQuestion = mb_strtolower(trim($validated['question']));
        $hasDuplicate = FeedbackQuestion::query()
            ->where('institution_id', $institution->id)
            ->whereRaw('LOWER(TRIM(question)) = ?', [$normalizedQuestion])
            ->exists();
        if ($hasDuplicate) {
            throw ValidationException::withMessages([
                'question' => ['This feedback question already exists.'],
            ]);
        }

        $orderIndex = $validated['order_index'] ?? (
            (int) FeedbackQuestion::query()
                ->where('institution_id', $institution->id)
                ->max('order_index')
        ) + 1;

        $question = FeedbackQuestion::query()->create([
            'institution_id' => $institution->id,
            'question' => $validated['question'],
            'order_index' => $orderIndex,
        ]);

        return response()->json([
            'message' => 'Feedback question created successfully.',
            'data' => $question,
        ], 201);
    }

    public function questionDestroy(Request $request, FeedbackQuestion $feedbackQuestion)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);

        if ($feedbackQuestion->institution_id !== $institution->id) {
            abort(404);
        }

        $questionCount = FeedbackQuestion::query()
            ->where('institution_id', $institution->id)
            ->count();
        if ($questionCount <= 1) {
            throw ValidationException::withMessages([
                'question' => ['At least one feedback question is required.'],
            ]);
        }

        $feedbackQuestion->delete();

        return response()->json([
            'message' => 'Feedback question deleted successfully.',
        ]);
    }

    public function linkStore(Request $request)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);

        $validated = $request->validate([
            'course_id' => ['required', 'string'],
            'semester' => ['required', 'integer', 'min:1', 'max:12'],
            'feedback_type' => ['required', Rule::in(self::FEEDBACK_TYPES)],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ]);

        /** @var Program $course */
        $course = $institution->programs()->whereKey($validated['course_id'])->firstOrFail();

        $hasQuestions = FeedbackQuestion::query()
            ->where('institution_id', $institution->id)
            ->exists();
        if (! $hasQuestions) {
            throw ValidationException::withMessages([
                'questions' => ['Add at least one feedback question before creating a feedback link.'],
            ]);
        }

        $token = Str::random(64);
        $link = FeedbackLink::query()->create([
            'institution_id' => $institution->id,
            'course_id' => $course->id,
            'created_by_user_id' => $request->user()->id,
            'semester' => $validated['semester'],
            'academic_year' => (int) $institution->academic_year,
            'feedback_type' => $validated['feedback_type'],
            'token_hash' => hash('sha256', $token),
            'share_token' => $token,
            'expires_at' => $validated['expires_at'] ?? null,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Feedback link created successfully.',
            'data' => [
                'id' => $link->id,
                'course_id' => $link->course_id,
                'semester' => $link->semester,
                'academic_year' => $link->academic_year,
                'feedback_type' => $link->feedback_type,
                'link' => rtrim((string) config('app.frontend_url'), '/').'/feedback?token='.$token,
                'expires_at' => optional($link->expires_at)->toISOString(),
            ],
        ], 201);
    }

    public function linkIndex(Request $request)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);

        $validated = $request->validate([
            'course_id' => ['required', 'string'],
            'semester' => ['required', 'integer', 'min:1', 'max:12'],
        ]);

        $institution->programs()->whereKey($validated['course_id'])->firstOrFail();

        $links = FeedbackLink::query()
            ->where('institution_id', $institution->id)
            ->where('course_id', $validated['course_id'])
            ->where('semester', $validated['semester'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'data' => FeedbackLinkSummaryResource::collection($links),
        ]);
    }

    public function submissionsIndex(Request $request)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);

        $validated = $request->validate([
            'course_id' => ['required', 'string'],
            'semester' => ['required', 'integer', 'min:1', 'max:12'],
        ]);

        $institution->programs()->whereKey($validated['course_id'])->firstOrFail();

        $submissions = StudentFeedback::query()
            ->whereHas('link', function ($query) use ($institution, $validated): void {
                $query->where('institution_id', $institution->id)
                    ->where('course_id', $validated['course_id'])
                    ->where('semester', $validated['semester']);
            })
            ->with([
                'student:id,full_name,register_no',
                'question:id,question,order_index',
                'link:id,feedback_type,expires_at,is_active,share_token',
            ])
            ->orderBy('feedback_link_id')
            ->orderBy('student_id')
            ->orderBy('question_id')
            ->get();

        $rows = $submissions
            ->groupBy(fn (StudentFeedback $submission): string => $submission->feedback_link_id.'|'.$submission->student_id)
            ->map(function (Collection $items): array {
                $link = $items->first()?->link;
                if ($link === null) {
                    return [];
                }
                $row = $this->mapAggregatedStudentFeedbackRow($items);

                return array_merge($row, [
                    'feedback_link_id' => $link->id,
                    'feedback_type' => $link->feedback_type,
                    'link_status' => $this->feedbackLinkAudienceStatus($link),
                    'share_url' => $link->shareUrl() ?? '',
                    'feedback_link_exists' => $items->first()?->link !== null,
                ]);
            })
            ->filter()
            ->values();

        return response()->json([
            'data' => SubjectFeedbackScopeRowResource::collection($rows),
        ]);
    }

    public function linkShow(string $token)
    {
        $link = $this->findActiveLink($token);

        return response()->json([
            'data' => [
                'course_id' => $link->course_id,
                'semester' => $link->semester,
                'academic_year' => $link->academic_year,
                'feedback_type' => $link->feedback_type,
                'link_active' => true,
            ],
        ]);
    }

    public function linkStart(Request $request, string $token)
    {
        $link = $this->findActiveLink($token);

        $validated = $request->validate([
            'register_no' => ['required', 'string', 'max:100'],
            'date_of_birth' => ['required', 'date'],
        ]);

        $student = $this->resolveStudentForLink($link, $validated['register_no'], $validated['date_of_birth']);

        $alreadySubmitted = StudentFeedback::query()
            ->where('feedback_link_id', $link->id)
            ->where('student_id', $student->id)
            ->exists();

        $questions = FeedbackQuestion::query()
            ->where('institution_id', $link->institution_id)
            ->orderBy('order_index')
            ->get();

        return response()->json([
            'data' => [
                'already_submitted' => $alreadySubmitted,
                'student' => [
                    'id' => $student->id,
                    'full_name' => $student->full_name,
                    'register_no' => $student->register_no,
                ],
                'questions' => $alreadySubmitted ? [] : $questions,
            ],
        ]);
    }

    public function linkSubmit(Request $request, string $token)
    {
        $link = $this->findActiveLink($token);

        $validated = $request->validate([
            'register_no' => ['required', 'string', 'max:100'],
            'date_of_birth' => ['required', 'date'],
            'ratings' => ['required', 'array', 'min:1'],
            'ratings.*.question_id' => ['required', 'string'],
            'ratings.*.rating' => ['required', 'integer', 'min:1', 'max:5'],
        ]);

        $student = $this->resolveStudentForLink($link, $validated['register_no'], $validated['date_of_birth']);

        $alreadySubmitted = StudentFeedback::query()
            ->where('feedback_link_id', $link->id)
            ->where('student_id', $student->id)
            ->exists();
        if ($alreadySubmitted) {
            throw ValidationException::withMessages([
                'feedback' => ['Feedback already submitted for this link.'],
            ]);
        }

        $questionIds = FeedbackQuestion::query()
            ->where('institution_id', $link->institution_id)
            ->orderBy('order_index')
            ->pluck('id');

        $submittedQuestionIds = collect($validated['ratings'])
            ->pluck('question_id')
            ->values();

        if ($submittedQuestionIds->duplicates()->isNotEmpty()) {
            throw ValidationException::withMessages([
                'ratings' => ['Duplicate question ratings are not allowed.'],
            ]);
        }

        $missingQuestionIds = $questionIds->diff($submittedQuestionIds);
        $extraQuestionIds = $submittedQuestionIds->diff($questionIds);
        if ($missingQuestionIds->isNotEmpty() || $extraQuestionIds->isNotEmpty()) {
            throw ValidationException::withMessages([
                'ratings' => ['Submit one rating for each active feedback question.'],
            ]);
        }

        DB::transaction(function () use ($validated, $link, $student): void {
            foreach ($validated['ratings'] as $item) {
                StudentFeedback::query()->create([
                    'semester' => $link->semester,
                    'course_id' => $link->course_id,
                    'student_id' => $student->id,
                    'feedback_link_id' => $link->id,
                    'question_id' => $item['question_id'],
                    'rating' => $item['rating'],
                    'academic_year' => $link->academic_year,
                    'feedback_type' => $link->feedback_type,
                ]);
            }
        });

        return response()->json([
            'message' => 'Feedback submitted successfully.',
        ], 201);
    }

    public function facultyIndex(Request $request, FeedbackLink $feedbackLink)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);

        if ($feedbackLink->institution_id !== $institution->id) {
            abort(404);
        }

        $submissions = StudentFeedback::query()
            ->where('feedback_link_id', $feedbackLink->id)
            ->with([
                'student:id,full_name,register_no',
                'question:id,question,order_index',
            ])
            ->orderBy('student_id')
            ->orderBy('question_id')
            ->get();

        $responses = $submissions
            ->groupBy('student_id')
            ->map(fn (Collection $items): array => $this->mapAggregatedStudentFeedbackRow($items))
            ->values();

        return StudentFeedbackFacultyIndexResource::make([
            'feedback_link_id' => $feedbackLink->id,
            'course_id' => $feedbackLink->course_id,
            'semester' => $feedbackLink->semester,
            'academic_year' => $feedbackLink->academic_year,
            'feedback_type' => $feedbackLink->feedback_type,
            'responses' => $responses->all(),
        ])->response();
    }

    public function facultyDestroy(Request $request, FeedbackLink $feedbackLink, Student $student)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);

        if ($feedbackLink->institution_id !== $institution->id) {
            abort(404);
        }

        if ($student->institution_id !== $institution->id || $student->program_id !== $feedbackLink->course_id) {
            abort(404);
        }

        $deleted = StudentFeedback::query()
            ->where('feedback_link_id', $feedbackLink->id)
            ->where('student_id', $student->id)
            ->delete();

        if ($deleted === 0) {
            abort(404);
        }

        return response()->json([
            'message' => 'Feedback response deleted successfully.',
        ]);
    }

    public function linkDestroy(Request $request, FeedbackLink $feedbackLink)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);

        if ($feedbackLink->institution_id !== $institution->id) {
            abort(404);
        }

        $feedbackLink->delete();

        return response()->json([
            'message' => 'Feedback link deleted successfully.',
        ]);
    }

    /**
     * @param  Collection<int, StudentFeedback>  $items
     * @return array{
     *     student_id: string|null,
     *     full_name: string|null,
     *     register_no: string|null,
     *     average_rating: float,
     *     ratings: Collection<int, array{question_id: string, question: string|null, order_index: int|null, rating: int}>
     * }
     */
    private function mapAggregatedStudentFeedbackRow(Collection $items): array
    {
        $student = $items->first()?->student;

        return [
            'student_id' => $student?->id,
            'full_name' => $student?->full_name,
            'register_no' => $student?->register_no,
            'average_rating' => round((float) $items->avg('rating'), 2),
            'ratings' => $items->map(fn (StudentFeedback $submission): array => [
                'question_id' => $submission->question_id,
                'question' => $submission->question?->question,
                'order_index' => $submission->question?->order_index,
                'rating' => $submission->rating,
            ])->values(),
        ];
    }

    private function feedbackLinkAudienceStatus(FeedbackLink $link): string
    {
        if ($link->is_active === false) {
            return 'inactive';
        }

        if ($link->expires_at !== null && $link->expires_at->lt(now())) {
            return 'expired';
        }

        return 'active';
    }

    private function findActiveLink(string $token): FeedbackLink
    {
        $hash = hash('sha256', $token);

        $link = FeedbackLink::query()
            ->where(function ($query) use ($token, $hash): void {
                $query->where('share_token', $token)
                    ->orWhere('token_hash', $hash);
            })
            ->where('is_active', true)
            ->where(function ($query): void {
                $query->whereNull('expires_at')->orWhere('expires_at', '>=', now());
            })
            ->first();

        if ($link === null) {
            throw ValidationException::withMessages([
                'token' => ['Feedback link is invalid or expired.'],
            ]);
        }

        return $link;
    }

    private function resolveStudentForLink(FeedbackLink $link, string $registerNo, string $dateOfBirth): Student
    {
        $student = Student::query()
            ->where('institution_id', $link->institution_id)
            ->where('program_id', $link->course_id)
            ->where('semester', $link->semester)
            ->where('academic_year', $link->academic_year)
            ->where('register_no', $registerNo)
            ->whereDate('date_of_birth', $dateOfBirth)
            ->first();

        if ($student === null) {
            throw ValidationException::withMessages([
                'credentials' => ['Register number or date of birth is invalid for this feedback link.'],
            ]);
        }

        return $student;
    }
}
