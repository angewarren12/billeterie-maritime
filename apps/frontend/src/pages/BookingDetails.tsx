import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import {
    CalendarIcon,
    ClockIcon,
    ChevronLeftIcon,
    ArrowDownTrayIcon,
    UserGroupIcon,
    InformationCircleIcon,
    IdentificationIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import QRCode from 'react-qr-code';

const BookingDetails = () => {
    const { id } = useParams<{ id: string }>();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            try {
                const response = await apiService.getBooking(id);
                setBooking(response.data);
            } catch (err) {
                console.error("Error fetching booking details", err);
                setError("Impossible de charger les détails de la réservation.");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleDownloadPdf = async () => {
        if (!id) return;
        try {
            await apiService.downloadBookingPdf(id);
        } catch (err) {
            alert("Erreur lors du téléchargement du PDF");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <p className="text-red-500 font-bold mb-4">{error || "Réservation introuvable"}</p>
                    <Link to="/mon-compte" className="btn-primary inline-block">Retour au tableau de bord</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Top Bar Mobile */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-40 lg:hidden">
                <div className="px-4 py-4 flex items-center justify-between">
                    <Link to="/mon-compte" className="p-2 -ml-2 text-gray-400">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </Link>
                    <h1 className="font-black text-gray-900 text-sm uppercase tracking-widest">Ma Réservation</h1>
                    <div className="w-10"></div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Header Desktop */}
                <div className="hidden lg:flex items-center justify-between mb-10">
                    <div className="space-y-1">
                        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                            <Link to="/mon-compte" className="hover:text-ocean-600 transition">Dashboard</Link>
                            <span className="text-gray-200">/</span>
                            <span className="text-ocean-600">Détails Réservation</span>
                        </nav>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-4">
                            Réservation #{booking.booking_reference}
                            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full uppercase tracking-widest font-black border border-green-200">
                                {booking.status === 'confirmed' ? 'Confirmée' : booking.status}
                            </span>
                        </h1>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={handleDownloadPdf} className="btn-primary px-6 py-3 flex items-center gap-2 shadow-lg shadow-ocean-100">
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            <span>Télécharger PDF</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Colonne Gauche: Itinéraire et Passagers (Summary) */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Carte Itinéraire */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                            <h3 className="text-lg font-black text-gray-900 mb-8 uppercase tracking-tighter">Votre Itinéraire</h3>

                            <div className="relative pl-8 space-y-12">
                                {/* Ligne verticale */}
                                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-ocean-500 to-ocean-100"></div>

                                <div className="relative">
                                    <div className="absolute -left-[27px] top-0 w-4 h-4 rounded-full bg-white border-4 border-ocean-600 shadow-sm"></div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Trajet Maritime</p>
                                    <p className="text-xl font-black text-gray-900">{booking.tickets?.[0]?.trip?.route?.name || booking.tickets?.[0]?.trip?.route || 'Port de départ'}</p>
                                    <div className="flex items-center gap-2 mt-2 text-gray-500 font-bold text-sm">
                                        <CalendarIcon className="w-4 h-4" />
                                        {new Date(booking.tickets?.[0]?.trip?.departure_time).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        <span className="text-gray-200">|</span>
                                        <ClockIcon className="w-4 h-4" />
                                        {new Date(booking.tickets?.[0]?.trip?.departure_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Liste rapide des passagers */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Passagers</h3>
                                <UserGroupIcon className="w-6 h-6 text-gray-300" />
                            </div>

                            <div className="space-y-4">
                                {booking.tickets?.map((ticket: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-black text-ocean-600">
                                                {i + 1}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900">{ticket.passenger_name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                    {ticket.passenger_type === 'adult' ? 'Adulte' : 'Enfant'} • {ticket.nationality_group === 'african' ? 'Africain' : ticket.nationality_group === 'senegalese' ? 'Sénégalais' : 'International'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Infos Paiement */}
                        <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Paiement</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-gray-400 italic">Total payé</span>
                                    <span className="text-2xl font-black tracking-tighter">{Number(booking.total_amount).toLocaleString()} FCFA</span>
                                </div>
                                <div className="flex justify-between items-center text-xs pt-4 border-t border-white/10">
                                    <span className="font-bold text-gray-400">Méthode</span>
                                    <span className="font-black uppercase">{booking.transactions?.[0]?.payment_method || 'Mobile Money'}</span>
                                </div>
                            </div>
                            <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-3">
                                <InformationCircleIcon className="w-5 h-5 text-ocean-400 shrink-0" />
                                <p className="text-[10px] font-medium leading-relaxed opacity-70">
                                    Cette réservation est confirmée. Vos billets digitaux sont prêts à être scannés.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Colonne Droite: Billets Digitaux (Détails) */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex items-center justify-between px-4">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Mes Billets Digitaux</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-ocean-600 bg-ocean-50 px-3 py-1 rounded-full">
                                {booking.tickets?.length} Passagers au total
                            </p>
                        </div>

                        <div className="space-y-12">
                            {Object.entries(
                                booking.tickets?.reduce((acc: any, ticket: any) => {
                                    const tripId = ticket.trip.id;
                                    if (!acc[tripId]) acc[tripId] = [];
                                    acc[tripId].push(ticket);
                                    return acc;
                                }, {}) || {}
                            ).map(([tripId, tickets]: [string, any], segmentIdx: number) => (
                                <div key={tripId} className="space-y-6">
                                    <div className="flex items-center gap-3 px-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs ${segmentIdx === 0 ? 'bg-ocean-600' : 'bg-primary-600'}`}>
                                            {segmentIdx + 1}
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 tracking-tighter">
                                            {segmentIdx === 0 ? 'Trajet Aller' : 'Trajet Retour'} : {tickets[0].trip.route?.name || tickets[0].trip.route}
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 gap-12">
                                        {tickets.map((ticket: any, idx: number) => (
                                            <div key={idx} className="group relative">
                                                {/* Ticket Stub Design - Top Part */}
                                                <div className="bg-white rounded-t-[3rem] border-x border-t border-gray-100 shadow-xl overflow-hidden">
                                                    <div className={`h-2 w-full ${segmentIdx === 0 ? 'bg-ocean-600' : 'bg-primary-600'}`}></div>
                                                    <div className="p-8 md:p-12">
                                                        <div className="flex flex-col md:flex-row justify-between gap-8">
                                                            <div className="flex-1 space-y-8">
                                                                <div className="flex items-center gap-6">
                                                                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-2xl ${segmentIdx === 0 ? 'bg-ocean-500' : 'bg-primary-500'}`}>
                                                                        <UserIcon className="w-8 h-8" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Détenteur du billet</p>
                                                                        <h4 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">{ticket.passenger_name}</h4>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                                                    <div>
                                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">CLASSE</p>
                                                                        <p className="text-sm font-black text-gray-900 uppercase">Économique</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">SIÈGE</p>
                                                                        <p className="text-sm font-black text-ocean-600 uppercase">LIBRE</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">NAVIRÉ</p>
                                                                        <p className="text-sm font-black text-gray-900 uppercase truncate max-w-[120px]">{ticket.trip.ship?.name || 'Navette Express'}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1.5">EMBARQUEMENT</p>
                                                                        <p className="text-sm font-black text-gray-900">
                                                                            {new Date(new Date(ticket.trip.departure_time).getTime() - 30 * 60000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col md:flex-col items-center justify-center gap-6 bg-gray-50/50 rounded-[2.5rem] p-8 border border-gray-100 min-w-[200px]">
                                                                <div className="bg-white p-4 rounded-3xl shadow-xl border border-gray-100">
                                                                    <QRCode
                                                                        value={ticket.qr_code_data || ticket.id}
                                                                        size={120}
                                                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                                                    />
                                                                </div>
                                                                <div className="text-center">
                                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">RÉFÉRENCE BILLET</p>
                                                                    <p className="text-xs font-black text-gray-900 font-mono tracking-wider">#{ticket.id.slice(0, 12).toUpperCase()}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Perforation Line */}
                                                <div className="relative h-12 bg-white border-x border-gray-100 flex items-center justify-center">
                                                    <div className="absolute left-[-16px] w-8 h-8 rounded-full bg-gray-50 border border-gray-100 shadow-inner"></div>
                                                    <div className="w-full mx-6 border-t-2 border-dashed border-gray-200"></div>
                                                    <div className="absolute right-[-16px] w-8 h-8 rounded-full bg-gray-50 border border-gray-100 shadow-inner"></div>
                                                </div>

                                                {/* Ticket Stub Design - Bottom Part */}
                                                <div className="bg-white rounded-b-[3rem] border-x border-b border-gray-100 p-8 shadow-xl flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                                                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                                                        </div>
                                                        <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Billet Valide</p>
                                                    </div>
                                                    <button onClick={handleDownloadPdf} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-ocean-600 transition-colors active:scale-90">
                                                        <ArrowDownTrayIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Note de bas de page */}
                        <div className="p-8 bg-ocean-50 rounded-[2.5rem] border border-ocean-100 flex items-start gap-4 mx-4">
                            <InformationCircleIcon className="w-6 h-6 text-ocean-600 shrink-0 mt-1" />
                            <div className="space-y-2">
                                <h4 className="font-black text-ocean-900 text-sm uppercase tracking-widest">Informations Importantes</h4>
                                <ul className="text-xs text-ocean-800/70 font-medium space-y-1 list-disc pl-4">
                                    <li>Présentez votre badge digital ou le code QR à chaque passager.</li>
                                    <li>L'embarquement commence 45 minutes avant le départ.</li>
                                    <li>Une pièce d'identité peut être demandée au portail.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDetails;
