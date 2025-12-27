import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../services/api';

export default function PublicTicket() {
    const { reference } = useParams();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (reference) {
            apiService.getPublicBooking(reference)
                .then(data => setBooking(data.booking))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [reference]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
        </div>
    );

    if (!booking) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <p className="text-red-500 font-bold mb-2">Billet introuvable</p>
                <p className="text-gray-400 text-sm">Vérifiez la référence du billet.</p>
            </div>
        </div>
    );

    const trip = booking.tickets && booking.tickets[0]?.trip;

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4">
            <div className="max-w-md mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 relative">
                {/* Header Decoration */}
                <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-ocean-400 to-ocean-600"></div>

                <div className="p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-ocean-50 rounded-full -mr-10 -mt-10 opacity-50"></div>
                    <div className="absolute top-0 left-0 w-20 h-20 bg-ocean-50 rounded-full -ml-8 -mt-4 opacity-50"></div>

                    <h1 className="text-ocean-600 font-black text-xl uppercase tracking-widest mb-1">Billet Maritime</h1>
                    <p className="text-gray-400 font-mono text-sm tracking-wider">REF: {booking.booking_reference}</p>
                </div>

                {trip && (
                    <div className="px-8 pb-6 text-center">
                        <div className="flex items-center justify-center gap-4 mb-2">
                            <span className="text-2xl font-black text-gray-900">{trip.route.departurePort.name}</span>
                            <div className="h-0.5 w-8 bg-gray-200 rounded-full"></div>
                            <span className="text-2xl font-black text-gray-900">{trip.route.arrivalPort.name}</span>
                        </div>
                        <p className="text-ocean-500 font-bold bg-ocean-50 inline-block px-4 py-1 rounded-full text-sm">
                            {new Date(trip.departure_time).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })} à {new Date(trip.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                )}

                <div className="bg-gray-50 border-y border-dashed border-gray-200 py-6 px-8 space-y-12">
                    {booking.tickets.map((ticket: any, idx: number) => (
                        <div key={idx} className="flex flex-col items-center gap-6">
                            <div className="text-center w-full">
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Passager {idx + 1}</p>
                                <p className="font-black text-xl text-gray-900">{ticket.passenger_name || 'Passager'}</p>
                            </div>

                            <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticket.qr_code_data || booking.booking_reference)}`}
                                    alt="QR Code"
                                    className="w-48 h-48 rounded-lg"
                                />
                            </div>

                            {booking.tickets.length > 1 && idx < booking.tickets.length - 1 && (
                                <div className="w-full border-b border-gray-200"></div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="p-8 text-center bg-white">
                    <p className="text-xs font-medium text-gray-400 leading-relaxed">
                        Ce QR code doit être présenté à l'embarquement.<br />
                        Bon voyage avec notre compagnie !
                    </p>
                </div>
            </div>
        </div>
    );
}
