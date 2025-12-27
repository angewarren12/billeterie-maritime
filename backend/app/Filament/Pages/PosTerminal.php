<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;

class PosTerminal extends Page
{
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-computer-desktop';
    protected static ?string $navigationLabel = 'Terminal (POS)';
    protected static ?string $title = 'Terminal de Vente';
    protected static \UnitEnum|string|null $navigationGroup = 'Ventes';
    
    protected string $view = 'filament.pages.pos-terminal';

    public $selectedRouteId;
    public $selectedTripId;
    
    // Cart Data
    public $cart = [];
    public $totalAmount = 0;
    
    // Form Data
    public $passengerName;
    public $passengerType = 'adult';
    public $nationalityGroup = 'national';

    public function mount()
    {
        // Auto-select first active route if available
        $route = \App\Models\Route::where('is_active', true)->first();
        if ($route) {
            $this->selectedRouteId = $route->id;
            $this->updatedSelectedRouteId();
        }
    }

    public function updatedSelectedRouteId()
    {
        // Auto-select next available trip
        $trip = \App\Models\Trip::where('route_id', $this->selectedRouteId)
            ->where('status', 'scheduled')
            ->where('departure_time', '>', now())
            ->orderBy('departure_time')
            ->first();
            
        $this->selectedTripId = $trip?->id;
        $this->cart = []; // Reset cart on route change
        $this->calculateTotal();
    }

    public function addToCart($type, $group)
    {
        if (!$this->selectedTripId) {
            \Filament\Notifications\Notification::make()->title('Veuillez sélectionner un trajet')->danger()->send();
            return;
        }

        // Calculate price
        $priceData = app(\App\Services\PricingService::class)->calculatePrice(
            $this->selectedRouteId,
            $type,
            $group
        );

        if (!$priceData['found']) {
            \Filament\Notifications\Notification::make()->title('Tarif introuvable')->body($priceData['error'])->danger()->send();
            return;
        }

        $this->cart[] = [
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'type' => $type,
            'group' => $group,
            'price' => $priceData['total'],
            'name' => '', // To be filled
        ];

        $this->calculateTotal();
    }

    public function removeFromCart($index)
    {
        unset($this->cart[$index]);
        $this->cart = array_values($this->cart);
        $this->calculateTotal();
    }

    public function calculateTotal()
    {
        $this->totalAmount = collect($this->cart)->sum('price');
    }

    public function checkout()
    {
        if (empty($this->cart) || !$this->selectedTripId) {
            \Filament\Notifications\Notification::make()
                ->warning()
                ->title('Panier vide')
                ->body('Veuillez ajouter au moins un passager.')
                ->send();
            return;
        }

        // Validation : tous les passagers doivent avoir un nom
        foreach ($this->cart as $item) {
            if (empty($item['name'])) {
                \Filament\Notifications\Notification::make()
                    ->warning()
                    ->title('Informations incomplètes')
                    ->body('Veuillez renseigner le nom de tous les passagers.')
                    ->send();
                return;
            }
        }

        try {
            \Illuminate\Support\Facades\DB::beginTransaction();

            // Créer la réservation
            $booking = \App\Models\Booking::create([
                'user_id' => auth()->id(),
                'booking_reference' => strtoupper(\Illuminate\Support\Str::random(8)),
                'total_amount' => $this->totalAmount,
                'status' => 'confirmed',
            ]);

            // Charger le trip pour avoir les IDs nécessaires
            $trip = \App\Models\Trip::find($this->selectedTripId);

            // Créer les tickets
            foreach ($this->cart as $item) {
                \App\Models\Ticket::create([
                    'booking_id' => $booking->id,
                    'trip_id' => $this->selectedTripId,
                    'passenger_name' => $item['name'],
                    'passenger_type' => $item['type'],
                    'nationality_group' => $item['group'],
                    'price_paid' => $item['price'],
                    'status' => 'issued',
                    'qr_code_data' => 'PENDING', // Will be generated after
                ]);
            }

            // Générer les QR codes pour tous les tickets
            $qrService = app(\App\Services\QrCodeService::class);
            $booking->load('tickets');
            
            foreach ($booking->tickets as $ticket) {
                $ticket->update([
                    'qr_code_data' => $qrService->generateForTicket($ticket)
                ]);
            }

            // Créer la transaction
            \App\Models\Transaction::create([
                'booking_id' => $booking->id,
                'amount' => $this->totalAmount,
                'payment_method' => 'cash',
                'status' => 'completed',
                'external_reference' => 'POS-' . strtoupper(\Illuminate\Support\Str::random(8)),
            ]);

            // Réduire la capacité  
            \App\Models\Trip::find($this->selectedTripId)->decrement('capacity_remaining', count($this->cart));

            \Illuminate\Support\Facades\DB::commit();

            // Générer le PDF
            $ticketService = app(\App\Services\TicketService::class);
            $pdf = $ticketService->generatePdf($booking);

            // Reset le panier
            $this->reset(['cart', 'totalAmount', 'selectedTripId']);

            \Filament\Notifications\Notification::make()
                ->success()
                ->title('Vente enregistrée')
                ->body("Réservation {$booking->booking_reference} créée avec succès !")
                ->send();

            // Télécharger le PDF
            return response()->streamDownload(function() use ($pdf) {
                echo $pdf->output();
            }, 'billets-' . $booking->booking_reference . '.pdf');

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            
            \Filament\Notifications\Notification::make()
                ->danger()
                ->title('Erreur')
                ->body('Une erreur est survenue lors de l\'enregistrement : ' . $e->getMessage())
                ->send();
        }
    }

    public function getViewData(): array
    {
        return [
            'routes' => \App\Models\Route::where('is_active', true)->with(['departurePort', 'arrivalPort'])->get(),
            'trips' => \App\Models\Trip::where('route_id', $this->selectedRouteId)
                ->where('status', 'scheduled')
                ->where('departure_time', '>', now())
                ->orderBy('departure_time')
                ->get(),
        ];
    }
}
