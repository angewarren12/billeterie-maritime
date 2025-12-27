<x-filament-panels::page>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        
        {{-- COLONNE GAUCHE : SÉLECTION & CATALOGUE --}}
        <div class="lg:col-span-2 space-y-6">
            
            {{-- SÉLECTEUR DE VOYAGE --}}
            <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 grid grid-cols-2 gap-4">
                <div>
                    <label class="text-xs font-bold text-gray-500 uppercase">Trajet</label>
                    <select wire:model.live="selectedRouteId" class="w-full mt-1 border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500">
                        <option value="">-- Choisir le Trajet --</option>
                        @foreach($this->getViewData()['routes'] as $route)
                            <option value="{{ $route->id }}">
                                {{ $route->departurePort->name }} ➔ {{ $route->arrivalPort->name }}
                            </option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label class="text-xs font-bold text-gray-500 uppercase">Prochain Départ</label>
                    <select wire:model.live="selectedTripId" class="w-full mt-1 border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500">
                        @forelse($this->getViewData()['trips'] as $trip)
                            <option value="{{ $trip->id }}">
                                {{ \Carbon\Carbon::parse($trip->departure_time)->format('d/m H:i') }} - {{ $trip->ship->name }}
                            </option>
                        @empty
                            <option>Aucun départ prévu</option>
                        @endforelse
                    </select>
                </div>
            </div>

            {{-- GRILLE TARIFAIRE (BOUTONS RAPIDES) --}}
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                @php
                    $types = \App\Models\PricingRule::getPassengerTypes();
                    $groups = \App\Models\PricingRule::getNationalityGroups();
                    // Combinaisons fréquentes pour accès rapide
                    $shortcuts = [
                        ['type' => 'adult', 'group' => 'national', 'label' => 'Adulte National', 'color' => 'bg-green-600 hover:bg-green-700'],
                        ['type' => 'child', 'group' => 'national', 'label' => 'Enfant National', 'color' => 'bg-green-500 hover:bg-green-600'],
                        ['type' => 'baby', 'group' => 'national', 'label' => 'Bébé National', 'color' => 'bg-green-400 hover:bg-green-500'],
                        
                        ['type' => 'adult', 'group' => 'resident', 'label' => 'Adulte Résident', 'color' => 'bg-blue-600 hover:bg-blue-700'],
                        ['type' => 'child', 'group' => 'resident', 'label' => 'Enfant Résident', 'color' => 'bg-blue-500 hover:bg-blue-600'],
                        
                        ['type' => 'adult', 'group' => 'non-resident', 'label' => 'Adulte Étranger', 'color' => 'bg-purple-600 hover:bg-purple-700'],
                        ['type' => 'child', 'group' => 'non-resident', 'label' => 'Enfant Étranger', 'color' => 'bg-purple-500 hover:bg-purple-600'],
                    ];
                @endphp

                @foreach($shortcuts as $btn)
                    <button wire:click="addToCart('{{ $btn['type'] }}', '{{ $btn['group'] }}')"
                            class="{{ $btn['color'] }} text-white p-6 rounded-xl shadow-lg transform transition hover:scale-105 active:scale-95 flex flex-col items-center justify-center gap-2">
                        <span class="text-lg font-bold">{{ $btn['label'] }}</span>
                        <!-- Prix indicatif pourrait être ajouté ici si on le pré-calcule -->
                        <div class="opacity-80 text-sm flex items-center gap-1">
                            <x-heroicon-o-plus-circle class="w-5 h-5"/>
                            Ajouter
                        </div>
                    </button>
                @endforeach
            </div>

        </div>

        {{-- COLONNE DROITE : PANIER --}}
        <div class="bg-gray-50 p-6 rounded-3xl border border-gray-200 shadow-xl flex flex-col h-[calc(100vh-100px)] sticky top-4">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <x-heroicon-o-shopping-cart class="w-8 h-8 text-green-600"/>
                Panier
            </h2>

            <div class="flex-1 overflow-y-auto space-y-4 pr-2">
                @forelse($cart as $index => $item)
                    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 group">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <div class="font-bold text-gray-800">
                                    {{ \App\Models\PricingRule::getPassengerTypes()[$item['type']] }}
                                </div>
                                <div class="text-xs text-gray-500 uppercase">
                                    {{ \App\Models\PricingRule::getNationalityGroups()[$item['group']] }}
                                </div>
                            </div>
                            <div class="font-mono font-bold text-green-700">
                                {{ number_format($item['price'], 0, ',', ' ') }} F
                            </div>
                        </div>
                        
                        <div class="flex gap-2 items-center">
                            <input type="text" 
                                   wire:model="cart.{{ $index }}.name"
                                   placeholder="Nom Complet du Passager"
                                   class="flex-1 w-full text-sm border-gray-200 rounded-md focus:ring-green-500 focus:border-green-500" required>
                            
                            <button wire:click="removeFromCart({{ $index }})" class="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50">
                                <x-heroicon-o-trash class="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                @empty
                    <div class="flex flex-col items-center justify-center h-48 text-gray-400">
                        <x-heroicon-o-shopping-bag class="w-16 h-16 mb-2 opacity-50"/>
                        <p>Panier vide</p>
                        <p class="text-xs">Sélectionnez un passager à gauche</p>
                    </div>
                @endforelse
            </div>

            <div class="mt-6 border-t pt-4">
                <div class="flex justify-between items-end mb-6">
                    <span class="text-gray-500 font-medium">Total à Payer</span>
                    <span class="text-4xl font-extrabold text-gray-900 tracking-tight">
                        {{ number_format($totalAmount, 0, ',', ' ') }} <span class="text-lg text-gray-500 font-normal">FCFA</span>
                    </span>
                </div>

                <button wire:click="checkout" 
                        wire:loading.attr="disabled"
                        wire:loading.class="opacity-50 cursor-not-allowed"
                        class="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xl py-4 rounded-2xl shadow-lg transform transition hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                    <x-heroicon-o-banknotes class="w-8 h-8" wire:loading.remove/>
                    <svg wire:loading class="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span wire:loading.remove>ENCAISSER & IMPRIMER</span>
                    <span wire:loading>Traitement...</span>
                </button>
            </div>
        </div>
    </div>
</x-filament-panels::page>
