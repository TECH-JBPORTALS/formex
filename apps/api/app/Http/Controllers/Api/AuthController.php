<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController
{
    public function login(Request $request)
    {

        $credentials = $request->validate([
            "email" => "required|string",
            "password" => "required|string"
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $request->session()->regenerate();

        return response()->json([
            'message' => "Signed in successful"
        ]);
    }

    public function create(Request $request)
    {
        $profile = $request->validate([
            "email" => "required|string",
            "password" => "required|string",
            "name" => "required|string"
        ]);

        $user = User::create($profile);

        Auth::login($user);

        $request->session()->regenerate();

        return response()->json([
            'message' => "Signed in successful"
        ]);
    }
}
