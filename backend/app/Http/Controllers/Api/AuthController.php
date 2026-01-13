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
        \Illuminate\Support\Facades\Log::info('Registration attempt:', $request->except(['password', 'password_confirmation']));
        
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'phone' => 'nullable|string|max:20',
                'password' => 'required|string|min:8',
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'password' => bcrypt($validated['password']),
            ]);

            \Illuminate\Support\Facades\Log::info('User created:', ['id' => $user->id, 'email' => $user->email]);

            // Auto login after register
            Auth::login($user);
            $request->session()->regenerate();

            \Illuminate\Support\Facades\Log::info('User logged in after registration:', ['id' => $user->id]);

            return response()->json(['data' => $user], 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Registration failed:', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    public function login(Request $request)
    {
        \Illuminate\Support\Facades\Log::info('Login attempt:', $request->except(['password']));

        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $request->session()->regenerate();

            \Illuminate\Support\Facades\Log::info('Login successful:', ['id' => $user->id, 'email' => $user->email]);

            // Mobile Agent: Return Token
            if ($request->header('X-Platform') === 'mobile') {
                $token = $user->createToken('mobile-agent')->plainTextToken;
                return response()->json(['data' => $user, 'token' => $token]);
            }

            // Web SPA: Return User (Session/Cookie handled by Laravel)
            return response()->json(['data' => $user]);
        }

        \Illuminate\Support\Facades\Log::warning('Login failed for email:', ['email' => $request->email]);

        return response()->json([
            'message' => 'The provided credentials do not match our records.',
        ], 401);
    }

    public function logout(Request $request)
    {
        $userId = Auth::id();
        \Illuminate\Support\Facades\Log::info('Logout attempt for user:', ['id' => $userId]);

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        \Illuminate\Support\Facades\Log::info('Logout successful for user:', ['id' => $userId]);

        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        // Charger le guichet et le port pour le POS
        return response()->json(['data' => $user->load(['roles', 'permissions', 'cashDesk.port'])]);
    }
}
