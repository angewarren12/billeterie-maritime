<x-filament-widgets::widget>
    <div class="welcome-card">
        <!-- Background Pattern -->
        <div class="welcome-card-bg">
            <svg class="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="1"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
        </div>

        <!-- Left Content -->
        <div class="welcome-content-left">
            <div class="welcome-title-row">
                <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: white;">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
                </svg>
                <h2 class="welcome-title">
                    {{ $this->getGreeting() }}, {{ $this->getUserName() }} !
                </h2>
            </div>
            <p class="welcome-subtitle">
                Bienvenue sur votre tableau de bord Maritime Express
            </p>
            <p class="welcome-date">
                {{ now()->isoFormat('dddd D MMMM YYYY') }} • {{ now()->format('H:i') }}
            </p>
        </div>

        <!-- Right Stats -->
        <div class="welcome-stats-container">
            <div class="welcome-stat-item">
                <div class="welcome-stat-value">{{ \App\Models\Booking::whereDate('created_at', today())->count() }}</div>
                <div class="welcome-stat-label">Réservations</div>
                <div class="welcome-stat-sub">Aujourd'hui</div>
            </div>
            <div class="welcome-divider"></div>
            <div class="welcome-stat-item">
                <div class="welcome-stat-value">{{ \App\Models\Trip::where('status', 'scheduled')->count() }}</div>
                <div class="welcome-stat-label">Traversées</div>
                <div class="welcome-stat-sub">Programmées</div>
            </div>
            <div class="welcome-divider"></div>
            <div class="welcome-stat-item">
                <div class="welcome-stat-value">{{ number_format(\App\Models\Booking::whereDate('created_at', today())->sum('total_amount'), 0, ',', ' ') }} <span style="font-size: 1rem;">FCFA</span></div>
                <div class="welcome-stat-label">Recettes</div>
                <div class="welcome-stat-sub">Du jour</div>
            </div>
        </div>
    </div>
</x-filament-widgets::widget>
