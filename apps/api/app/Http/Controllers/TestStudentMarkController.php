<?php

namespace App\Http\Controllers;

use App\Models\CourseOutcome;
use App\Models\Program;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Test;
use App\Models\TestStudentMark;
use App\Support\CurrentInstitutionSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TestStudentMarkController
{
    public function matrix(Request $request, Program $program)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        /** @var Program $program */
        $program = $institution->programs()->whereKey($program->id)->firstOrFail();

        $validated = $request->validate([
            'semester' => ['required', 'integer', 'min:1', 'max:6'],
            'subject_id' => ['required', 'string', 'exists:subjects,id'],
        ]);
        $semester = (int) $validated['semester'];

        /** @var Subject $subject */
        $subject = $program->subjects()->whereKey($validated['subject_id'])->firstOrFail();
        abort_unless((int) $subject->semester === $semester, 422, 'Selected subject does not match the semester filter.');

        // All program students for the current academic year (same as
        // Program students index). Do not filter by student.semester: it often
        // does not match the subject's semester in data entry, which hid most
        // students from this list.
        $students = $program->students()
            ->where('academic_year', $institution->academic_year)
            ->orderBy('register_no')
            ->orderBy('full_name')
            ->get(['id', 'full_name', 'register_no']);

        $tests = Test::query()
            ->where('program_id', $program->id)
            ->where('subject_id', $subject->id)
            ->where('semester', $semester)
            ->where('academic_year', $institution->academic_year)
            ->with(['courseOutcomeMarks'])
            ->orderBy('cie_number')
            ->orderBy('name')
            ->get();

        $courseOutcomes = CourseOutcome::query()
            ->where('program_id', $program->id)
            ->where('course_id', $subject->id)
            ->orderBy('name')
            ->get();

        $marks = TestStudentMark::query()
            ->where('program_id', $program->id)
            ->whereIn('test_id', $tests->pluck('id'))
            ->whereIn('student_id', $students->pluck('id'))
            ->get(['student_id', 'test_id', 'course_outcome_id', 'marks']);

        $marksByKey = [];
        foreach ($marks as $row) {
            $marksByKey["{$row->student_id}:{$row->test_id}:{$row->course_outcome_id}"] = $row->marks;
        }

        $outcomeBlocks = [];
        foreach ($courseOutcomes as $co) {
            $cieColumns = [];
            $totalAllotted = 0.0;
            for ($cn = 1; $cn <= 6; $cn++) {
                $test = $tests->first(function (Test $t) use ($cn) {
                    return (int) $t->cie_number === $cn;
                });

                $pivot = $test
                    ? $test->courseOutcomeMarks->firstWhere('course_outcome_id', $co->id)
                    : null;
                $max = $pivot ? (int) $pivot->assigned_marks : 0;
                $totalAllotted += $max;

                $marksByColumn = [];
                if ($pivot && $test !== null && $max > 0) {
                    foreach ($students as $student) {
                        $key = "{$student->id}:{$test->id}:{$co->id}";
                        $marksByColumn[$student->id] = $marksByKey[$key] ?? null;
                    }
                } else {
                    foreach ($students as $student) {
                        $marksByColumn[$student->id] = null;
                    }
                }

                $cieColumns[] = [
                    'cie_number' => $cn,
                    'test' => $test !== null ? [
                        'id' => $test->id,
                        'name' => $test->name,
                        'maximum_marks' => (int) $test->maximum_marks,
                    ] : null,
                    'max_marks' => $max,
                    'marks_by_student' => $marksByColumn,
                ];
            }

            $obtainedByStudent = [];
            $targetAchievedByStudent = [];
            $targetPercentage = (int) ($co->target_percentage ?? 60);
            $targetMarks = round(($totalAllotted * $targetPercentage) / 100, 2);
            foreach ($students as $student) {
                $obtained = 0;
                foreach ($cieColumns as $col) {
                    if (! isset($col['test']) || ! is_array($col['test']) || (int) $col['max_marks'] <= 0) {
                        continue;
                    }
                    $v = $col['marks_by_student'][$student->id] ?? null;
                    if ($v === null) {
                        continue;
                    }
                    $n = (int) $v;
                    if ($n >= 0) {
                        $obtained += $n;
                    }
                }
                $obtainedByStudent[$student->id] = $obtained;
                $targetAchievedByStudent[$student->id] = $totalAllotted > 0
                    && $obtained >= $targetMarks
                    ? 'Yes'
                    : 'N';
            }

            $outcomeBlocks[] = [
                'course_outcome' => [
                    'id' => $co->id,
                    'name' => $co->name,
                    'description' => $co->description,
                ],
                'total_allotted' => round($totalAllotted, 2),
                'target_percentage' => $targetPercentage,
                'target_marks' => $targetMarks,
                'total_obtained_by_student' => $obtainedByStudent,
                'target_achieved_by_student' => $targetAchievedByStudent,
                'cie_columns' => $cieColumns,
            ];
        }

        return response()->json([
            'data' => [
                'subject' => [
                    'id' => $subject->id,
                    'name' => $subject->name,
                    'code' => $subject->code ?? $subject->short_name,
                ],
                'students' => $students,
                'outcome_blocks' => $outcomeBlocks,
            ],
        ]);
    }

    public function upsert(Request $request, Program $program)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        /** @var Program $program */
        $program = $institution->programs()->whereKey($program->id)->firstOrFail();

        $validated = $request->validate([
            'semester' => ['required', 'integer', 'min:1', 'max:6'],
            'subject_id' => ['required', 'string', 'exists:subjects,id'],
            'rows' => ['required', 'array'],
            'rows.*.student_id' => ['required', 'string', 'exists:students,id'],
            'rows.*.test_id' => ['required', 'string', 'exists:tests,id'],
            'rows.*.course_outcome_id' => ['required', 'string', 'exists:course_outcomes,id'],
            'rows.*.marks' => ['nullable', 'integer', 'min:0'],
        ]);

        $semester = (int) $validated['semester'];
        $rows = $validated['rows'];

        /** @var Subject $upsertSubject */
        $upsertSubject = $program->subjects()->whereKey($validated['subject_id'])->firstOrFail();
        abort_unless((int) $upsertSubject->semester === $semester, 422, 'Selected subject does not match the semester filter.');

        $testIds = collect($rows)->pluck('test_id')->unique()->values();
        $tests = Test::query()
            ->where('program_id', $program->id)
            ->where('subject_id', $upsertSubject->id)
            ->whereIn('id', $testIds)
            ->where('semester', $semester)
            ->where('academic_year', $institution->academic_year)
            ->with('courseOutcomeMarks')
            ->get()
            ->keyBy('id');

        if ($tests->count() !== $testIds->count()) {
            abort(422, 'One or more tests are invalid for this program and semester.');
        }

        $studentIds = collect($rows)->pluck('student_id')->unique()->values();
        $validStudentCount = Student::query()
            ->where('program_id', $program->id)
            ->whereIn('id', $studentIds)
            ->where('academic_year', $institution->academic_year)
            ->pluck('id')
            ->count();
        if ($validStudentCount !== $studentIds->count()) {
            abort(422, 'One or more students are not in this program for the current academic year.');
        }

        $coIds = collect($rows)->pluck('course_outcome_id')->unique()->values();
        $validCoCount = CourseOutcome::query()
            ->where('program_id', $program->id)
            ->where('course_id', $upsertSubject->id)
            ->whereIn('id', $coIds)
            ->pluck('id')
            ->count();
        if ($validCoCount !== $coIds->count()) {
            abort(422, 'One or more course outcomes are invalid for the selected subject.');
        }

        DB::transaction(function () use ($rows, $tests, $institution, $program): void {
            foreach ($rows as $row) {
                $test = $tests->get($row['test_id']);
                if (! $test) {
                    abort(422, 'Invalid test.');
                }
                $pivot = $test->courseOutcomeMarks->firstWhere('course_outcome_id', $row['course_outcome_id']);
                if (! $pivot) {
                    abort(422, 'This test does not include marks for the given course outcome.');
                }
                $cap = (int) $pivot->assigned_marks;
                if ($test->maximum_marks < $cap) {
                    abort(422, 'Test configuration is inconsistent: assigned marks exceed test maximum.');
                }

                if ($row['marks'] === null) {
                    TestStudentMark::query()
                        ->where('student_id', $row['student_id'])
                        ->where('test_id', $row['test_id'])
                        ->where('course_outcome_id', $row['course_outcome_id'])
                        ->delete();

                    continue;
                }

                $marks = (int) $row['marks'];
                if ($marks > $cap) {
                    abort(422, "Marks may not exceed the allocated {$cap} for this course outcome on this test.");
                }

                $sumOtherCos = (int) TestStudentMark::query()
                    ->where('student_id', $row['student_id'])
                    ->where('test_id', $row['test_id'])
                    ->where('course_outcome_id', '!=', $row['course_outcome_id'])
                    ->sum('marks');
                if ($sumOtherCos + $marks > (int) $test->maximum_marks) {
                    abort(422, "Total marks for this test cannot exceed the test maximum ({$test->maximum_marks}).");
                }

                TestStudentMark::query()->updateOrCreate(
                    [
                        'student_id' => $row['student_id'],
                        'test_id' => $row['test_id'],
                        'course_outcome_id' => $row['course_outcome_id'],
                    ],
                    [
                        'institution_id' => $institution->id,
                        'program_id' => $program->id,
                        'marks' => $marks,
                        'academic_year' => $institution->academic_year,
                    ],
                );
            }
        });

        $request->merge([
            'semester' => $semester,
            'subject_id' => $validated['subject_id'],
        ]);

        return $this->matrix($request, $program);
    }
}
