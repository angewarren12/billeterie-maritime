import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { CheckCircleIcon, TicketIcon, CalendarIcon, ArrowLeftIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const Confirmation = () => {
    const { id } = useParams<{ id: string }>();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const fetchBooking = async () => {
            if (!id) return;
            try {
                const data = await apiService.getBooking(id);
                setBooking(data.booking);
            } catch (error) {
                console.error("Error fetching booking details:", error);
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
                                        {booking.tickets[0]?.trip?.route} • {new Date(booking.tickets[0]?.trip?.departure_time).toLocaleString('fr-FR', {
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
