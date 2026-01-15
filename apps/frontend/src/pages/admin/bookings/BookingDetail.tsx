import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../../../services/api';
import {
    TicketIcon,
    CalendarIcon,
    UserIcon,
    ClockIcon,
    ChevronLeftIcon,
    MapPinIcon,
    CreditCardIcon,
    IdentificationIcon,
    CheckCircleIcon,
    LifebuoyIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function BookingDetail() {
    const { id } = useParams<{ id: string }>();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) loadBooking();
    }, [id]);

    const loadBooking = async () => {
        try {
            setLoading(true);
            const response = await apiService.getAdminBookingDetail(id!);
            setBooking(response.data);
        } catch (error) {
            console.error("Error loading booking details", error);
            toast.error("Impossible de charger les détails de la réservation");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadTicket = async () => {
        try {
            await apiService.downloadBookingPdf(booking.id.toString());
            toast.success("Téléchargement lancé");
        } catch (error) {
            console.error("Download error", error);
            toast.error("Impossible de télécharger le billet");
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 border-4 border-ocean-500/20 border-t-ocean-500 rounded-full animate-spin"></div>
                <p className="text-gray-400 font-black uppercase tracking-widest animate-pulse">Chargement...</p>
            </div>
        );
    }

    if (!booking) return (
        <div className="text-center py-20">
            <p className="text-gray-500">Réservation introuvable.</p>
            <Link to="/admin/bookings" className="text-ocean-500 font-bold mt-4 block">Retour aux réservations</Link>
        </div>
    );

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400';
            case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400';
            case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header / Nav */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <Link to="/admin/bookings" className="inline-flex items-center gap-2 text-gray-500 hover:text-ocean-600 dark:hover:text-white transition-colors font-bold group">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-transparent flex items-center justify-center group-hover:bg-ocean-500 group-hover:text-white transition-colors shadow-sm dark:shadow-none">
                        <ChevronLeftIcon className="w-4 h-4" />
                    </div>
                    Retour aux réservations
                </Link>

                <div className="flex items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${getStatusStyle(booking.status)}`}>
                        {booking.status}
                    </span>
                    <span className="text-sm font-mono font-bold text-gray-400 dark:text-gray-500">ID: {booking.id}</span>
                </div>
            </div>

            {/* Main Info Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: General Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-gray-800/40 rounded-[2.5rem] p-8 lg:p-10 border border-gray-100 dark:border-white/5 shadow-xl dark:shadow-2xl">
                        <div className="flex items-center gap-6 mb-10">
                            <div className="w-16 h-16 rounded-2xl bg-ocean-500 text-white flex items-center justify-center shadow-lg shadow-ocean-500/30">
                                <TicketIcon className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                                    Réf: {booking.booking_reference}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">Réalisée le {new Date(booking.created_at).toLocaleString('fr-FR')}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Client</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                        <UserIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{booking.user?.name || 'Invité'}</p>
                                        <p className="text-xs text-gray-500">{booking.user?.email || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Paiement</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-ocean-50 dark:bg-ocean-900/20 flex items-center justify-center text-ocean-600 dark:text-ocean-400">
                                        <CreditCardIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{booking.total_amount.toLocaleString()} FCFA</p>
                                        <p className="text-xs text-gray-500 uppercase">{booking.payment_method}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tickets List */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-ocean-500 rounded-full"></div>
                            Billets émis ({booking.tickets?.length || 0})
                        </h2>

                        <div className="grid grid-cols-1 gap-4">
                            {booking.tickets?.map((ticket: any) => (
                                <div key={ticket.id} className="bg-white dark:bg-gray-800/20 border border-gray-100 dark:border-white/5 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 group hover:bg-white dark:hover:bg-white/5 transition-all">
                                    <div className="flex items-center gap-6">
                                        {ticket.qr_code_data && (
                                            <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm shrink-0">
                                                <div className="w-16 h-16">
                                                    <QRCode
                                                        value={ticket.qr_code_data}
                                                        size={256}
                                                        style={{ height: "100%", width: "100%" }}
                                                        viewBox={`0 0 256 256`}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-ocean-50 dark:bg-ocean-900/30 rounded-xl text-ocean-600 dark:text-ocean-400">
                                                <IdentificationIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{ticket.passenger_type} • {ticket.nationality_group}</p>
                                                <p className="font-bold text-gray-900 dark:text-white text-lg">{ticket.passenger_name}</p>
                                                <p className="text-xs font-mono text-ocean-500 dark:text-ocean-400/60 mt-0.5">{ticket.ticket_number}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:items-end">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${ticket.return_trip_id ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {ticket.return_trip_id ? 'Aller-Retour' : 'Aller Simple'}
                                            </span>
                                        </div>
                                        <p className="text-sm font-black text-gray-900 dark:text-white">{Number(ticket.price_paid || 0).toLocaleString()} FCFA</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {ticket.is_validated ? (
                                                <span className="flex items-center gap-1 text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded">
                                                    <CheckCircleIcon className="w-3 h-3" /> Validé
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-white/5 px-2 py-1 rounded">
                                                    <ClockIcon className="w-3 h-3" /> En attente
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDownloadTicket(); }}
                                            className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-ocean-600 bg-ocean-50 hover:bg-ocean-100 dark:bg-ocean-500/10 dark:hover:bg-ocean-500/20 dark:text-ocean-400 px-3 py-2 rounded-lg transition-colors border border-ocean-100 dark:border-ocean-500/20 shadow-sm"
                                        >
                                            <ArrowDownTrayIcon className="w-4 h-4" />
                                            Télécharger
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Trip & Transaction Info */}
                <div className="space-y-8">
                    {/* Trip Info Card */}
                    <div className="bg-gradient-to-br from-ocean-900 to-ocean-800 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <h3 className="text-xs font-black text-ocean-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <LifebuoyIcon className="w-4 h-4" /> Détails du Voyage
                        </h3>

                        {booking.tickets && booking.tickets[0]?.trip ? (
                            <div className="space-y-6">
                                <div>
                                    <p className="text-2xl font-black">{booking.tickets[0].trip.route?.name || 'Trajet inconnu'}</p>
                                    <p className="text-ocean-300 text-sm mt-1">Navire: {booking.tickets[0].trip.ship?.name || 'N/A'}</p>
                                </div>

                                <div className="space-y-4 bg-white/5 rounded-2xl p-4 border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <CalendarIcon className="w-5 h-5 text-ocean-300" />
                                        <div>
                                            <p className="text-[10px] font-black text-ocean-400 uppercase tracking-widest">Départ le</p>
                                            <p className="font-bold">{new Date(booking.tickets[0].trip.departure_time).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <ClockIcon className="w-5 h-5 text-ocean-300" />
                                        <div>
                                            <p className="text-[10px] font-black text-ocean-400 uppercase tracking-widest">Heure</p>
                                            <p className="text-xl font-black">{new Date(booking.tickets[0].trip.departure_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center gap-2 text-ocean-300 text-xs italic">
                                    <MapPinIcon className="w-4 h-4" />
                                    {booking.tickets[0].trip.route?.departure_port?.name} → {booking.tickets[0].trip.route?.arrival_port?.name}
                                </div>
                            </div>
                        ) : (
                            <p className="text-ocean-400 italic">Détails du voyage non disponibles</p>
                        )}
                    </div>

                    {/* Transactions */}
                    <div className="bg-white dark:bg-gray-800/40 rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-xl">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6">Transactions</h3>
                        <div className="space-y-4">
                            {booking.transactions?.map((tx: any) => (
                                <div key={tx.id} className="flex justify-between items-center border-b border-gray-50 dark:border-white/5 pb-4 last:border-0 last:pb-0">
                                    <div>
                                        <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">{tx.type}</p>
                                        <p className="text-[10px] text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900 dark:text-white">{tx.amount.toLocaleString()} F</p>
                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${tx.status === 'completed' ? 'text-green-600 bg-green-50 dark:bg-green-500/10' : 'text-gray-400 bg-gray-50 dark:bg-white/5'}`}>
                                            {tx.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {(!booking.transactions || booking.transactions.length === 0) && (
                                <p className="text-xs text-gray-500 italic text-center py-4">Aucune transaction enregistrée</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
