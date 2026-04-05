<?php

namespace App\Support;

use App\Models\Institution;
use App\Models\User;
use Illuminate\Http\Request;

class CurrentInstitutionSession
{
    public const string SESSION_KEY = 'current_institution_id';

    /**
     * Session map of institution id → academic year (calendar year), per institution.
     */
    public const string ACADEMIC_YEAR_BY_INSTITUTION_KEY = 'academic_year_by_institution';

    /**
     * @return array{0: Institution|null, 1: string|null, 2: int|null}
     */
    public static function sync(Request $request, User $user): array
    {
        $user->load('institutions');

        if ($user->institutions->isEmpty()) {
            $request->session()->forget(self::SESSION_KEY);
            $request->session()->forget(self::ACADEMIC_YEAR_BY_INSTITUTION_KEY);

            return [null, null, null];
        }

        $ids = $user->institutions->pluck('id');
        $currentId = $request->session()->get(self::SESSION_KEY);

        if ($currentId !== null && $ids->contains($currentId)) {
            $institution = $user->institutions->firstWhere('id', $currentId);
            if ($institution !== null) {
                $year = self::ensureAcademicYear($request, (string) $currentId);

                return [$institution, (string) $currentId, $year];
            }
        }

        $default = $user->institutions->sortBy('name')->values()->first();
        if ($default === null) {
            $request->session()->forget(self::SESSION_KEY);
            $request->session()->forget(self::ACADEMIC_YEAR_BY_INSTITUTION_KEY);

            return [null, null, null];
        }

        $request->session()->put(self::SESSION_KEY, $default->id);
        $year = self::ensureAcademicYear($request, $default->id);

        return [$default, $default->id, $year];
    }

    public static function setAcademicYear(Request $request, string $institutionId, int $year): void
    {
        $map = $request->session()->get(self::ACADEMIC_YEAR_BY_INSTITUTION_KEY, []);
        if (! is_array($map)) {
            $map = [];
        }

        $map[$institutionId] = $year;
        $request->session()->put(self::ACADEMIC_YEAR_BY_INSTITUTION_KEY, $map);
    }

    public static function ensureAcademicYear(Request $request, string $institutionId): int
    {
        $map = $request->session()->get(self::ACADEMIC_YEAR_BY_INSTITUTION_KEY, []);
        if (! is_array($map)) {
            $map = [];
        }

        if (array_key_exists($institutionId, $map)) {
            $validated = filter_var($map[$institutionId], FILTER_VALIDATE_INT);
            if ($validated !== false && $validated >= 2000 && $validated <= 2100) {
                $map[$institutionId] = $validated;
                $request->session()->put(self::ACADEMIC_YEAR_BY_INSTITUTION_KEY, $map);

                return $validated;
            }
        }

        $map[$institutionId] = (int) now()->year;
        $request->session()->put(self::ACADEMIC_YEAR_BY_INSTITUTION_KEY, $map);

        return $map[$institutionId];
    }

    public static function requireInstitution(Request $request): Institution
    {
        $user = $request->user();
        if ($user === null) {
            abort(401);
        }

        [$institution] = self::sync($request, $user);

        if ($institution === null) {
            abort(404);
        }

        return $institution;
    }
}
