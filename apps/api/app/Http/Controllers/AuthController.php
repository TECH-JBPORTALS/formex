<?php

namespace App\Http\Controllers;

use App\Http\Resources\AuthSessionResource;
use App\Models\User;
use App\Support\CurrentInstitutionSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController
{
    /**
     * Register a new user and start a session.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique(User::class)],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json(null, 201);
    }

    /**
     * Attempt session login (SPA / cookie).
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (
            ! Auth::attempt([
                'email' => $credentials['email'],
                'password' => $credentials['password'],
            ], $request->boolean('remember'))
        ) {
            throw ValidationException::withMessages([
                'email' => [trans('auth.failed')],
            ]);
        }

        $request->session()->regenerate();

        return response()->json([
            'two_factor' => false,
        ]);
    }

    /**
     * End the current session.
     */
    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }

    /**
     * Return the authenticated user for the current session.
     */
    public function user(Request $request): JsonResponse
    {
        return $this->authSessionResponse($request);
    }

    /**
     * Persist the active institution for this session (membership validated against the database).
     */
    public function setCurrentInstitution(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'institution_id' => ['required', 'string'],
        ]);

        $user = $request->user();
        $user->load('institutions');

        if (! $user->institutions->pluck('id')->contains($validated['institution_id'])) {
            throw ValidationException::withMessages([
                'institution_id' => ['You do not belong to this institution.'],
            ]);
        }

        $request->session()->put(
            CurrentInstitutionSession::SESSION_KEY,
            $validated['institution_id'],
        );

        return $this->authSessionResponse($request);
    }

    private function authSessionResponse(Request $request): JsonResponse
    {
        $user = $request->user()->load('institutions');
        [$currentInstitution, $currentInstitutionId] = CurrentInstitutionSession::sync($request, $user);

        return AuthSessionResource::make([
            'user' => $user,
            'current_institution' => $currentInstitution,
            'current_institution_id' => $currentInstitutionId,
        ])->response();
    }
}
