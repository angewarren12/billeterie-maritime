<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
        ]);

        // Auto login after register
        Auth::login($user);
        $request->session()->regenerate();

        return response()->json(['data' => $user], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $request->session()->regenerate();

            // Mobile Agent: Return Token
            if ($request->header('X-Platform') === 'mobile') {
                $token = $user->createToken('mobile-agent')->plainTextToken;
                return response()->json(['data' => $user, 'token' => $token]);
            }

            // Web SPA: Return User (Session/Cookie handled by Laravel)
            return response()->json(['data' => $user]);
        }

        return response()->json([
            'message' => 'The provided credentials do not match our records.',
        ], 401);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $cacheKey = "user_me_{$user->id}";
        
        $userData = \Illuminate\Support\Facades\Cache::remember($cacheKey, 60, function() use ($user) {
            return $user->load(['roles', 'permissions']); // Aggressive loading for auth check
        });

        return response()->json(['data' => $userData]);
    }
}
