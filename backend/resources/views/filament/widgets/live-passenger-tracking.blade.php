<x-filament-widgets::widget>
    <x-filament::section>
        <x-slot name="heading">
            <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-primary-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <span>Suivi Temps Réel des Passagers</span>
                <span class="ml-auto text-xs text-gray-500 dark:text-gray-400">
                    Mise à jour toutes les 5s
                </span>
            </div>
        </x-slot>

        <div class="space-y-6">
            <!-- Current Trips -->
            <div>
                <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Embarquements en Cours
                </h3>
                
                @forelse($this->getCurrentTrips() as $trip)
                    <div class="mb-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300">
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex-1">
                                <div class="flex items-center gap-2">
                                    <span class="font-semibold text-lg">
                                        {{ $trip['departure'] }} → {{ $trip['arrival'] }}
                                    </span>
                                    <x-filament::badge :color="$trip['status_color']">
                                        {{ match($trip['status']) {
                                            'boarding' => 'Embarquement',
                                            'departed' => 'Parti',
                                            'scheduled' => 'Programmé',
                                            default => $trip['status']
                                        } }}
                                    </x-filament::badge>
                                </div>
                                <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {{ $trip['ship'] }} • Départ: {{ $trip['departure_time'] }}
                                </div>
                            </div>
                            
                            <div class="text-right">
                                <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                    {{ $trip['boarded'] }}/{{ $trip['capacity'] }}
                                </div>
                                <div class="text-xs text-gray-500">
                                    {{ $trip['boarding_progress'] }}% embarqués
                                </div>
                            </div>
                        </div>

                        <!-- Progress Bar -->
                        <div class="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div class="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out"
                                 style="width: {{ $trip['boarding_progress'] }}%">
                            </div>
                        </div>

                        <!-- Stats Grid -->
                        <div class="grid grid-cols-3 gap-4 mt-3">
                            <div class="text-center p-2 rounded bg-green-50 dark:bg-green-900/20">
                                <div class="text-lg font-bold text-green-600 dark:text-green-400">
                                    {{ $trip['boarded'] }}
                                </div>
                                <div class="text-xs text-gray-600 dark:text-gray-400">
                                    Embarqués
                                </div>
                            </div>
                            <div class="text-center p-2 rounded bg-orange-50 dark:bg-orange-900/20">
                                <div class="text-lg font-bold text-orange-600 dark:text-orange-400">
                                    {{ $trip['pending_tickets'] }}
                                </div>
                                <div class="text-xs text-gray-600 dark:text-gray-400">
                                    En Attente
                                </div>
                            </div>
                            <div class="text-center p-2 rounded bg-blue-50 dark:bg-blue-900/20">
                                <div class="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {{ $trip['remaining'] }}
                                </div>
                                <div class="text-xs text-gray-600 dark:text-gray-400">
                                    Places Restantes
                                </div>
                            </div>
                        </div>
                    </div>
                @empty
                    <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                        <svg class="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                        </svg>
                        Aucun embarquement en cours
                    </div>
                @endforelse
            </div>

            <!-- Recent Boardings -->
            <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Derniers Embarquements (30 min)
                </h3>
                
                <div class="space-y-2">
                    @forelse($this->getRecentBoardings() as $boarding)
                        <div class="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                                <svg class="w-4 h-4 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                                </svg>
                            </div>
                            <div class="flex-1">
                                <div class="font-medium text-sm">{{ $boarding['passenger'] }}</div>
                                <div class="text-xs text-gray-500">{{ $boarding['trip'] }}</div>
                            </div>
                            <div class="text-xs text-gray-500">
                                {{ $boarding['time'] }}
                            </div>
                        </div>
                    @empty
                        <div class="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                            Aucun embarquement récent
                        </div>
                    @endforelse
                </div>
            </div>
        </div>
    </x-filament::section>
</x-filament-widgets::widget>
