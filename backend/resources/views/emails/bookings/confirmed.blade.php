<!DOCTYPE html>
<html>
<head>
    <title>Confirmation de Réservation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #004e64;">Merci pour votre réservation !</h2>
        
        <p>Bonjour,</p>
        <p>Votre réservation <strong>#{{ $booking->booking_reference }}</strong> a bien été confirmée.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Trajet :</strong> {{ $booking->trip->route->departurePort->name }} → {{ $booking->trip->route->arrivalPort->name }}</p>
            <p><strong>Date de départ :</strong> {{ \Carbon\Carbon::parse($booking->trip->departure_time)->format('d/m/Y H:i') }}</p>
            <p><strong>Navire :</strong> {{ $booking->trip->ship->name }}</p>
            <p><strong>Nombre de passagers :</strong> {{ $booking->tickets->count() }}</p>
        </div>

        <h3>Vos Billets</h3>
        <p>Vous trouverez vos billets ci-dessous. Veuillez présenter le QR code à l'embarquement.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            @foreach($booking->tickets as $ticket)
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px;">
                    <strong>{{ $ticket->passenger_name }}</strong><br>
                    <span style="font-size: 0.9em; color: #666;">Type: {{ ucfirst($ticket->passenger_type) }}</span>
                </td>
                <td style="padding: 10px; text-align: right;">
                    Ticket ID: {{ $ticket->qr_code_data }}
                </td>
            </tr>
            @endforeach
        </table>
        
        <p style="margin-top: 30px;">
            <a href="{{ url('/bookings/' . $booking->booking_reference) }}" style="background-color: #004e64; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Voir ma réservation en ligne</a>
        </p>
        
        <p style="font-size: 0.8em; color: #888; margin-top: 30px;">
            Ceci est un message automatique, merci de ne pas y répondre.<br>
            LinxTicket Maritime
        </p>
    </div>
</body>
</html>
