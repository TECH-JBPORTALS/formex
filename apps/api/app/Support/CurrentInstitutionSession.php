<?php

namespace App\Support;

use App\Models\Institution;
use App\Models\User;
use Illuminate\Http\Request;

class CurrentInstitutionSession
{
    public const string SESSION_KEY = 'current_institution_id';

    /**
     * @return array{0: Institution|null, 1: string|null}
     */
    public static function sync(Request $request, User $user): array
    {
        $user->load('institutions');

        if ($user->institutions->isEmpty()) {
            $request->session()->forget(self::SESSION_KEY);

            return [null, null];
        }

        $ids = $user->institutions->pluck('id');
        $currentId = $request->session()->get(self::SESSION_KEY);

        if ($currentId !== null && $ids->contains($currentId)) {
            $institution = $user->institutions->firstWhere('id', $currentId);
            if ($institution !== null) {
                return [$institution, $currentId];
            }
        }

        $default = $user->institutions->sortBy('name')->values()->first();
        if ($default === null) {
            $request->session()->forget(self::SESSION_KEY);

            return [null, null];
        }

        $request->session()->put(self::SESSION_KEY, $default->id);

        return [$default, $default->id];
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
