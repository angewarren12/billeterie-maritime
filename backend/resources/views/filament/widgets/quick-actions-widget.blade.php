<x-filament-widgets::widget>
    <x-filament::section>
        <x-slot name="heading">
            <div class="flex items-center gap-2">
                <x-filament::icon
                    icon="heroicon-m-bolt"
                    class="h-5 w-5 text-primary-500"
                />
                <span>Actions Rapides</span>
            </div>
        </x-slot>

        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {{-- Nouvelle Traversée --}}
            <a href="{{ route('filament.admin.resources.trips.create') }}" 
               class="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary-500 hover:bg-primary-50 transition-all group">
                <x-filament::icon icon="heroicon-o-ship-wheel" class="h-8 w-8 text-gray-400 group-hover:text-primary-600 mb-2" />
                <span class="text-xs font-bold text-gray-600 group-hover:text-primary-700">Nouveau Voyage</span>
            </a>

            {{-- Nouvelle Réservation --}}
            <a href="{{ route('filament.admin.resources.bookings.create') }}" 
               class="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-success-500 hover:bg-success-50 transition-all group">
                <x-filament::icon icon="heroicon-o-ticket" class="h-8 w-8 text-gray-400 group-hover:text-success-600 mb-2" />
                <span class="text-xs font-bold text-gray-600 group-hover:text-success-700">Vendre Billet</span>
            </a>

            {{-- Ajouter un Navire --}}
            <a href="{{ route('filament.admin.resources.ships.create') }}" 
               class="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-info-500 hover:bg-info-50 transition-all group">
                <x-filament::icon icon="heroicon-o-plus-circle" class="h-8 w-8 text-gray-400 group-hover:text-info-600 mb-2" />
                <span class="text-xs font-bold text-gray-600 group-hover:text-info-700">Ajouter Navire</span>
            </a>

            {{-- Voir les Rapports --}}
            <a href="#" 
               class="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-warning-500 hover:bg-warning-50 transition-all group opacity-50 cursor-not-allowed">
                <x-filament::icon icon="heroicon-o-chart-bar" class="h-8 w-8 text-gray-400 group-hover:text-warning-600 mb-2" />
                <span class="text-xs font-bold text-gray-600 group-hover:text-warning-700">Rapports Financiers</span>
            </a>

            {{-- Gestion Agents --}}
            <a href="{{ route('filament.admin.resources.users.index') }}" 
               class="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-danger-500 hover:bg-danger-50 transition-all group">
                <x-filament::icon icon="heroicon-o-users" class="h-8 w-8 text-gray-400 group-hover:text-danger-600 mb-2" />
                <span class="text-xs font-bold text-gray-600 group-hover:text-danger-700">Gérer Agents</span>
            </a>

            {{-- Paramètres Système --}}
            <a href="#" 
               class="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-500 hover:bg-gray-100 transition-all group opacity-50 cursor-not-allowed">
                <x-filament::icon icon="heroicon-o-cog-6-tooth" class="h-8 w-8 text-gray-400 group-hover:text-gray-600 mb-2" />
                <span class="text-xs font-bold text-gray-600 group-hover:text-gray-700">Configuration</span>
            </a>
        </div>
    </x-filament::section>
</x-filament-widgets::widget>
