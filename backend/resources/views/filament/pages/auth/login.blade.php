<x-filament-panels::page.simple>
    <style>
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-30px); }
            to { opacity: 1; transform: translateX(0); }
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }

        .login-wrapper {
            min-height: 100vh;
            display: flex;
        }

        .left-panel {
            background: linear-gradient(135deg, #5f9ea0 0%, #4a7c7e 50%, #3d6466 100%);
            position: relative;
            overflow: hidden;
        }

        .left-panel::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
            opacity: 0.3;
        }

        .right-panel {
            background: #f8f9fa;
            animation: fadeIn 0.6s ease-out;
        }

        .dark .right-panel {
            background: #1f2937;
        }

        .logo-section {
            animation: slideInLeft 0.8s ease-out;
        }

        .stats-card {
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            animation: float 3s ease-in-out infinite;
        }

        .form-container {
            animation: fadeIn 0.8s ease-out 0.2s both;
        }

        .input-field {
            transition: all 0.3s ease;
        }

        .input-field:focus {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(95, 158, 160, 0.2);
        }

        .login-btn {
            background: linear-gradient(135deg, #81c784 0%, #66bb6a 100%);
            transition: all 0.3s ease;
        }

        .login-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(102, 187, 106, 0.3);
        }

        .wave-decoration {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            opacity: 0.1;
        }
    </style>

    <div class="login-wrapper">
        <!-- Left Panel - Marketing Content -->
        <div class="left-panel hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 text-white relative">
            <div class="wave-decoration">
                <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#ffffff" fill-opacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,101.3C1248,85,1344,75,1392,69.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>

            <div class="logo-section max-w-lg z-10">
                <!-- Logo -->
                <div class="text-center mb-8">
                    <img src="{{ asset('images/logo.png') }}" 
                         alt="Maritime Express" 
                         class="h-20 mx-auto mb-4 drop-shadow-2xl">
                </div>

                <!-- Stats Card -->
                <div class="stats-card rounded-2xl p-6 mb-8">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold">Statistiques du Jour</h3>
                        <span class="text-sm opacity-75">{{ now()->format('d M Y') }}</span>
                    </div>
                    
                    <div class="grid grid-cols-3 gap-4 mb-6">
                        <div class="text-center">
                            <div class="text-sm opacity-75 mb-1">Réservations</div>
                            <div class="text-3xl font-bold">{{ rand(10, 50) }}</div>
                        </div>
                        <div class="text-center">
                            <div class="text-sm opacity-75 mb-1">Passagers</div>
                            <div class="text-3xl font-bold">{{ rand(100, 300) }}</div>
                        </div>
                        <div class="text-center">
                            <div class="text-sm opacity-75 mb-1">Traversées</div>
                            <div class="text-3xl font-bold">{{ rand(5, 15) }}</div>
                        </div>
                    </div>

                    <!-- Progress Circle -->
                    <div class="flex justify-center">
                        <div class="relative w-32 h-32">
                            <svg class="transform -rotate-90 w-32 h-32">
                                <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.2)" stroke-width="8" fill="none"/>
                                <circle cx="64" cy="64" r="56" stroke="#81c784" stroke-width="8" fill="none"
                                        stroke-dasharray="351.86" stroke-dashoffset="105.56"
                                        class="transition-all duration-1000"/>
                            </svg>
                            <div class="absolute inset-0 flex items-center justify-center">
                                <span class="text-2xl font-bold">70%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tagline -->
                <div class="text-center">
                    <h1 class="text-3xl font-bold mb-4">
                        Gérez, Protégez et Organisez
                    </h1>
                    <h2 class="text-2xl font-light mb-6 opacity-90">
                        Votre <span class="italic">Transport Maritime</span>
                    </h2>
                    <p class="text-sm opacity-75 leading-relaxed">
                        Accédez à votre tableau de bord pour gérer les réservations,
                        suivre les embarquements en temps réel et optimiser vos traversées.
                    </p>
                </div>
            </div>
        </div>

        <!-- Right Panel - Login Form -->
        <div class="right-panel w-full lg:w-1/2 flex items-center justify-center p-8">
            <div class="form-container w-full max-w-md">
                <!-- Mobile Logo -->
                <div class="lg:hidden text-center mb-8">
                    <img src="{{ asset('images/logo.png') }}" 
                         alt="Maritime Express" 
                         class="h-16 mx-auto mb-4">
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                        Maritime Express
                    </h1>
                </div>

                <!-- Welcome Text -->
                <div class="mb-8">
                    <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Bienvenue !
                    </h2>
                    <p class="text-gray-600 dark:text-gray-400">
                        Connectez-vous pour accéder à votre espace
                    </p>
                </div>

                <!-- Login Form -->
                <div class="space-y-6">
                    {{ $this->form }}

                    <x-filament::button
                        type="submit"
                        form="authenticate"
                        class="login-btn w-full !bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600"
                        size="lg"
                    >
                        Se connecter
                    </x-filament::button>

                    <!-- Divider -->
                    <div class="relative my-6">
                        <div class="absolute inset-0 flex items-center">
                            <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div class="relative flex justify-center text-sm">
                            <span class="px-4 bg-gray-50 dark:bg-gray-800 text-gray-500">
                                Liaison Maritime Dakar-Gorée
                            </span>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="text-center text-sm text-gray-600 dark:text-gray-400">
                        <p>© {{ date('Y') }} Maritime Express</p>
                        <p class="mt-1">Version 1.0.0</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-filament-panels::page.simple>
