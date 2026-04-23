<?php

namespace App\Http\Controllers;

use App\Models\Program;
use App\Models\ProgramSuccessIndex;
use App\Support\CurrentInstitutionSession;
use Illuminate\Http\Request;

class ProgramSuccessIndexController
{
    public function rows(Request $request, Program $program)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $program = $institution->programs()->whereKey($program->id)->firstOrFail();

        $rows = ProgramSuccessIndex::query()
            ->where('program_id', $program->id)
            ->orderByDesc('academic_year')
            ->get()
            ->map(fn (ProgramSuccessIndex $row) => [
                'academic_year' => (int) $row->academic_year,
                'admitted_count' => (int) $row->admitted_count,
                'passed_without_backlog_count' => (int) $row->passed_without_backlog_count,
                'backlog_count' => max(0, (int) $row->admitted_count - (int) $row->passed_without_backlog_count),
            ])
            ->values();

        return response()->json([
            'data' => $rows,
        ]);
    }

    public function show(Request $request, Program $program)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $program = $institution->programs()->whereKey($program->id)->firstOrFail();

        $validated = $request->validate([
            'academic_year' => ['nullable', 'integer', 'min:1900', 'max:9999'],
        ]);

        $lygYear = (int) ($validated['academic_year'] ?? $institution->academic_year ?? now()->year);
        $years = [
            ['key' => 'lyg', 'year' => $lygYear],
            ['key' => 'lyg_m1', 'year' => $lygYear - 1],
            ['key' => 'lyg_m2', 'year' => $lygYear - 2],
        ];

        $rows = $this->buildRows($program->id, $years);

        $average = round(
            (
                $rows['lyg']['success_index'] +
                $rows['lyg_m1']['success_index'] +
                $rows['lyg_m2']['success_index']
            ) / 3,
            4,
        );

        return response()->json([
            'data' => [
                'program_id' => $program->id,
                'lyg' => $rows['lyg'],
                'lyg_m1' => $rows['lyg_m1'],
                'lyg_m2' => $rows['lyg_m2'],
                'average_success_index' => $average,
            ],
        ]);
    }

    public function upsert(Request $request, Program $program)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $program = $institution->programs()->whereKey($program->id)->firstOrFail();

        $validated = $request->validate([
            'rows' => ['required', 'array', 'min:1'],
            'rows.*.academic_year' => ['required', 'integer', 'min:1900', 'max:9999'],
            'rows.*.admitted_count' => ['required', 'integer', 'min:0'],
            'rows.*.passed_without_backlog_count' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($validated['rows'] as $row) {
            $admitted = (int) $row['admitted_count'];
            $passed = (int) $row['passed_without_backlog_count'];
            if ($passed > $admitted) {
                abort(422, 'Passed without backlog count cannot exceed admitted count.');
            }

            ProgramSuccessIndex::query()->updateOrCreate(
                [
                    'program_id' => $program->id,
                    'academic_year' => (int) $row['academic_year'],
                ],
                [
                    'admitted_count' => $admitted,
                    'passed_without_backlog_count' => $passed,
                ],
            );
        }

        return $this->show($request, $program);
    }

    /**
     * @return array{
     *   admitted_count: int,
     *   passed_without_backlog_count: int,
     *   success_index: float
     * }
     */
    private function metricsForYear(string $programId, int $academicYear): array
    {
        $row = ProgramSuccessIndex::query()
            ->where('program_id', $programId)
            ->where('academic_year', $academicYear)
            ->first();

        $admittedCount = (int) ($row?->admitted_count ?? 0);
        $passedCount = (int) ($row?->passed_without_backlog_count ?? 0);
        if ($admittedCount === 0) {
            return [
                'admitted_count' => 0,
                'passed_without_backlog_count' => 0,
                'success_index' => 0.0,
            ];
        }

        return [
            'admitted_count' => $admittedCount,
            'passed_without_backlog_count' => $passedCount,
            'success_index' => round($passedCount / $admittedCount, 4),
        ];
    }

    /**
     * @param  array<int, array{key: string, year: int}>  $years
     * @return array{
     *   lyg: array{academic_year: int, admitted_count: int, passed_without_backlog_count: int, success_index: float},
     *   lyg_m1: array{academic_year: int, admitted_count: int, passed_without_backlog_count: int, success_index: float},
     *   lyg_m2: array{academic_year: int, admitted_count: int, passed_without_backlog_count: int, success_index: float}
     * }
     */
    private function buildRows(string $programId, array $years): array
    {
        $rows = [];
        foreach ($years as $entry) {
            $metrics = $this->metricsForYear($programId, $entry['year']);
            $rows[$entry['key']] = [
                'academic_year' => $entry['year'],
                ...$metrics,
            ];
        }

        return $rows;
    }
}
