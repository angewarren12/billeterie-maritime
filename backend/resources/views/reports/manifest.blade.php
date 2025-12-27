<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Manifeste Passagers - {{ $trip->route->departurePort->name }} / {{ $trip->route->arrivalPort->name }}</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
        .header h1 { color: #6366f1; margin: 0; }
        .info-grid { width: 100%; margin-bottom: 20px; }
        .info-grid td { padding: 5px; }
        .manifest-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .manifest-table th { background-color: #f3f4f6; padding: 10px; border: 1px solid #d1d5db; text-align: left; }
        .manifest-table td { padding: 8px; border: 1px solid #e5e7eb; }
        .footer { position: fixed; bottom: 0; width: 100%; text-align: right; font-size: 10px; color: #9ca3af; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Manifeste de Passagers</h1>
        <p>Généré le {{ now()->format('d/m/Y H:i') }}</p>
    </div>

    <table class="info-grid">
        <tr>
            <td><strong>Liaison :</strong> {{ $trip->route->departurePort->name }} ➔ {{ $trip->route->arrivalPort->name }}</td>
            <td><strong>Navire :</strong> {{ $trip->ship->name }}</td>
        </tr>
        <tr>
            <td><strong>Départ prévu :</strong> {{ $trip->departure_time->format('d/m/Y H:i') }}</td>
            <td><strong>Nombre de Passagers :</strong> {{ $trip->tickets->count() }}</td>
        </tr>
    </table>

    <table class="manifest-table">
        <thead>
            <tr>
                <th>#</th>
                <th>Nom du Passager</th>
                <th>Type</th>
                <th>Nationalité</th>
                <th>Ref. Réservation</th>
                <th>Statut Ticket</th>
            </tr>
        </thead>
        <tbody>
            @foreach($trip->tickets as $index => $ticket)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $ticket->passenger_name ?? 'N/A' }}</td>
                <td>{{ ucfirst($ticket->passenger_type) }}</td>
                <td>{{ strtoupper($ticket->nationality_group) }}</td>
                <td><code>{{ $ticket->booking->booking_reference }}</code></td>
                <td>{{ ucfirst($ticket->status) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Maritime Express - Système de Billetterie Informatisé
    </div>
</body>
</html>
