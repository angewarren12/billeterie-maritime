import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { CheckCircleIcon, TicketIcon, CalendarIcon, ArrowLeftIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../features/auth/hooks/useAuth';

const Confirmation = () => {
    const { id } = useParams<{ id: string }>();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const { isLogged } = useAuth();


    useEffect(() => {
        const fetchBooking = async () => {
            if (!id) return;

            // Try to load from cache first for instant display
            const cacheKey = `booking_${id}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                try {
                    setBooking(JSON.parse(cached));
                    setLoading(false);
                } catch (e) {
                    console.error("Error parsing cached booking:", e);
                }
            }

            // Then fetch fresh data in background
            try {
                const response = await apiService.getBooking(id);
                setBooking(response.data);
                // Update cache
                localStorage.setItem(cacheKey, JSON.stringify(response.data));
            } catch (error) {
                console.error("Error fetching booking details:", error);
                // If we have cache, keep showing it
                if (!cached) {
                    setBooking(null);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [id]);

    const handleDownload = async () => {
        if (!id) return;
        setDownloading(true);
        try {
            await apiService.downloadBookingPdf(id);
        } catch (error) {
            console.error("Error downloading PDF:", error);
            alert("Erreur lors du téléchargement du PDF.");
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl mb-8">
                    <p className="text-xl font-semibold">Réservation introuvable</p>
                    <p>Désolé, nous n'avons pas pu charger les détails de votre réservation.</p>
                </div>
                <Link to="/" className="btn-primary inline-flex items-center gap-2">
                    <ArrowLeftIcon className="w-5 h-5" />
                    Retour à l'accueil
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Success Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden mb-8">
                    <div className="bg-green-500 p-8 text-center text-white">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
                            <CheckCircleIcon className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Merci pour votre réservation !</h1>
                        <p className="text-green-50 opacity-90">Votre paiement a été traité avec succès.</p>
                    </div>

                    <div className="p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-8 border-b border-gray-100">
                            <div>
                                <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-1">Référence Réservation</p>
                                <p className="text-2xl font-black text-gray-900">{booking.booking_reference}</p>
                            </div>
                            <div className="text-left md:text-right">
                                <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-1">Montant Total</p>
                                <p className="text-2xl font-bold text-ocean-600">{parseFloat(booking.total_amount).toLocaleString()} FCFA</p>
                            </div>
                        </div>

                        <div className="space-y-6 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-ocean-50 rounded-xl">
                                    <CalendarIcon className="w-6 h-6 text-ocean-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Détails du voyage</h3>
                                    <p className="text-gray-500">
                                        {booking.tickets[0]?.trip?.route?.name || booking.tickets[0]?.trip?.route} • {new Date(booking.tickets[0]?.trip?.departure_time).toLocaleString('fr-FR', {
                                            dateStyle: 'long',
                                            timeStyle: 'short'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-ocean-50 rounded-xl">
                                    <TicketIcon className="w-6 h-6 text-ocean-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Passagers ({booking.tickets.length})</h3>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {booking.tickets.map((ticket: any, idx: number) => (
                                            <span key={idx} className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                                {ticket.passenger_name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* QR Codes Section */}
                        <div className="mb-8">
                            <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                                <TicketIcon className="w-6 h-6 text-ocean-600" />
                                Vos billets électroniques
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {booking.tickets.map((ticket: any, idx: number) => (
                                    <div key={idx} className="bg-gradient-to-br from-ocean-900 to-ocean-800 rounded-2xl p-6 text-white shadow-2xl shadow-ocean-300/50 border border-ocean-700">
                                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/20">
                                            <div>
                                                <p className="text-xs text-ocean-300 font-bold uppercase tracking-wider mb-1">Passager {idx + 1}</p>
                                                <p className="font-black text-lg">{ticket.passenger_name}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${ticket.status === 'issued' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                                                ticket.status === 'used' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
                                                    'bg-gray-500/20 text-gray-300 border border-gray-400/30'
                                                }`}>
                                                {ticket.status === 'issued' ? 'Valide' : ticket.status === 'used' ? 'Utilisé' : ticket.status}
                                            </span>
                                        </div>

                                        {/* QR Code Display */}
                                        <div className="bg-white p-4 rounded-xl mb-4">
                                            <div className="flex items-center justify-center">
                                                <img
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticket.qr_code_data)}`}
                                                    alt={`QR Code pour ${ticket.passenger_name}`}
                                                    className="w-40 h-40"
                                                />
                                            </div>
                                        </div>

                                        <div className="text-center mb-4">
                                            <p className="text-xs text-ocean-300 font-mono mb-1">Code de référence</p>
                                            <p className="text-sm font-bold text-white/90">{ticket.qr_code_data}</p>
                                        </div>

                                        {/* Individual Ticket Link */}
                                        <div className="bg-white/10 p-3 rounded-xl border border-white/20">
                                            <p className="text-xs text-ocean-200 font-bold mb-2 text-center">🔗 Lien personnel du billet</p>
                                            <div className="flex gap-2">
                                                <input
                                                    readOnly
                                                    value={`${window.location.origin}/ticket/${ticket.qr_code_data}`}
                                                    className="flex-1 px-3 py-2 bg-white/90 text-gray-800 rounded-lg text-xs font-mono select-all"
                                                />
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(`${window.location.origin}/ticket/${ticket.qr_code_data}`);
                                                        alert('✅ Lien copié !');
                                                    }}
                                                    className="px-3 py-2 bg-ocean-500 hover:bg-ocean-400 text-white font-bold rounded-lg text-xs transition"
                                                >
                                                    📋
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-4 text-center italic">
                                💡 Présentez ces codes QR à l'embarquement
                            </p>
                        </div>

                        {/* Lien de partage public */}
                        <div className="bg-ocean-50 p-6 rounded-2xl border border-ocean-100 mb-8">
                            <h3 className="font-bold text-ocean-800 mb-2">Partager le billet</h3>
                            <p className="text-sm text-ocean-600 mb-4">Envoyez ce lien aux autres passagers pour qu'ils récupèrent leur billet.</p>
                            <div className="flex gap-2">
                                <input
                                    readOnly
                                    value={`${window.location.origin}/billet/${booking.booking_reference}`}
                                    className="flex-1 p-3 bg-white border border-ocean-200 rounded-xl text-sm font-mono text-gray-600 select-all"
                                />
                                <button
                                    onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/billet/${booking.booking_reference}`); alert('Lien copié !') }}
                                    className="px-4 py-2 bg-ocean-600 text-white font-bold rounded-xl hover:bg-ocean-700 transition"
                                >
                                    Copier
                                </button>
                            </div>
                        </div>

                        <div className="bg-ocean-900 rounded-2xl p-6 text-white mb-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <ArrowDownTrayIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-semibold">Vos billets sont prêts !</p>
                                    <p className="text-sm text-ocean-100 italic">Un email de confirmation contenant vos QR codes a été envoyé.</p>
                                </div>
                            </div>
                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="w-full bg-white text-ocean-900 font-bold py-3 rounded-xl hover:bg-ocean-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {downloading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-ocean-900"></div>
                                ) : (
                                    <ArrowDownTrayIcon className="w-5 h-5" />
                                )}
                                Télécharger en PDF
                            </button>
                        </div>

                        {isLogged ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Link to="/" className="btn-secondary py-3 flex items-center justify-center gap-2">
                                    <ArrowLeftIcon className="w-5 h-5" />
                                    Retour à l'accueil
                                </Link>
                                <Link to="/mon-compte" className="btn-primary py-3 flex items-center justify-center gap-2 shadow-lg shadow-ocean-200">
                                    Consulter mon compte
                                    <TicketIcon className="w-5 h-5" />
                                </Link>
                            </div>
                        ) : (
                            <Link to="/" className="btn-secondary py-3 flex items-center justify-center gap-2 w-full">
                                <ArrowLeftIcon className="w-5 h-5" />
                                Retour à l'accueil
                            </Link>
                        )}
                    </div>
                </div>

                <p className="text-center text-gray-400 text-sm">
                    Besoin d'aide ? Contactez notre support au +221 33 800 00 00
                </p>
            </div>
        </div>
    );
};

export default Confirmation;
