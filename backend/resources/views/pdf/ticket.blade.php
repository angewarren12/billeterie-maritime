<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Billet Maritime Express</title>
    <style>
        body { font-family: sans-serif; color: #333; margin: 0; padding: 0; }
        .page-break { page-break-after: always; }
        .header { background-color: #22c55e; color: white; padding: 20px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; text-transform: uppercase; }
        .content { padding: 30px; }
        .route-info { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
        .route-name { font-size: 24px; font-weight: bold; color: #16a34a; }
        .trip-date { font-size: 16px; color: #666; margin-top: 5px; }
        .passenger-card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; position: relative; }
        .qr-code { position: absolute; top: 20px; right: 20px; width: 120px; height: 120px; }
        .label { font-size: 12px; text-transform: uppercase; color: #888; margin-bottom: 4px; }
        .value { font-size: 16px; font-weight: bold; margin-bottom: 15px; }
        .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 10px; color: #999; padding: 10px; border-top: 1px solid #eee; }
        .status-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; background: #e5e7eb; font-size: 12px; }
        .status-valid { background: #dcfce7; color: #166534; }
    </style>
</head>
<body>
    @foreach($tickets as $index => $data)
        @php $ticket = $data['model']; $trip = $ticket->trip; @endphp
        
        <div class="header">
            <div class="logo">Maritime Express</div>
            <div>Billet Électronique</div>
        </div>

        <div class="content">
            <div class="route-info">
                <div class="route-name">
                    {{ $trip->route->departurePort->name }} ➔ {{ $trip->route->arrivalPort->name }}
                </div>
                <div class="trip-date">
                    Départ : {{ \Carbon\Carbon::parse($trip->departure_time)->format('d/m/Y à H:i') }}
                    <br>
                    Navire : {{ $trip->ship->name }}
                </div>
            </div>

            <div class="passenger-card">
                <div class="qr-code">
                    <img src="{{ $data['qr_code'] }}" style="width: 100%; height: auto;">
                </div>

                <div style="width: 70%;">
                    <div class="label">Passager</div>
                    <div class="value">{{ $ticket->passenger_name }}</div>

                    <div style="display: flex; gap: 40px;">
                        <div>
                            <div class="label">Type</div>
                            <div class="value">
                                @if($ticket->passenger_type == 'child') Enfant
                                @elseif($ticket->passenger_type == 'baby') Bébé
                                @else Adulte
                                @endif
                            </div>
                        </div>
                        <div>
                            <div class="label">Nationalité</div>
                            <div class="value">
                                @if($ticket->nationality_group == 'national') National / CEDEAO
                                @elseif($ticket->nationality_group == 'resident') Résident
                                @else Étranger
                                @endif
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 40px;">
                        <div>
                            <div class="label">Référence Réservation</div>
                            <div class="value">{{ $booking->booking_reference }}</div>
                        </div>
                        <div>
                            <div class="label">N° Billet</div>
                            <div class="value">#{{ $ticket->id }}</div>
                        </div>
                    </div>
                
                    <div class="label">Prix Payé</div>
                    <div class="value">{{ number_format($ticket->price_paid, 0, ',', ' ') }} FCFA</div>
                </div>
            </div>

            <div style="margin-top: 30px; font-size: 14px; line-height: 1.6; color: #555;">
                <strong>Instructions d'embarquement :</strong>
                <ul>
                    <li>Présentez-vous au port 30 minutes avant le départ.</li>
                    <li>Munissez-vous d'une pièce d'identité valide correspondant au billet.</li>
                    <li>Ce code QR sera scanné à l'entrée du terminal.</li>
                </ul>
            </div>
        </div>

        <div class="footer">
            Page {{ $index + 1 }} / {{ count($tickets) }} • Émis le {{ now()->format('d/m/Y H:i') }} • Maritime Express Inc.
        </div>

        @if(!$loop->last)
            <div class="page-break"></div>
        @endif
    @endforeach
</body>
</html>
