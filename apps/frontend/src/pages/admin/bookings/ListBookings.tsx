import { useState, useEffect } from 'react';
import { apiService } from '../../../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
    MagnifyingGlassIcon,
    TicketIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    TableCellsIcon,
    Squares2X2Icon,
    UserIcon
} from '@heroicons/react/24/outline';

// Define Interface locally or import if available
interface Booking {
    id: string;
    booking_reference: string;
    total_amount: number;
    status: string;
    created_at: string;
    user?: {
        name: string;
        email: string;
    };
    trip?: {
        departure_time: string;
        route?: {
            name?: string;
            departure_port?: { name: string };
            arrival_port?: { name: string };
            departurePort?: { name: string };
            arrivalPort?: { name: string };
        };
        ship?: {
            name: string;
        };
    };
    tickets: Array<{
        return_trip_id?: string;
    }>;
}

export default function ListBookings() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        loadBookings();
    }, [search, page, statusFilter]);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const response = await apiService.getAdminBookings({ search, status: statusFilter, page });
            // response est { data: paginator_object, internal_time_ms: ... }
            setBookings(response.data.data || []);
            setPagination(response.data);
            console.log(`🎫 [Bookings] Chargé en ${response.internal_time_ms}ms (Backend)`);
        } catch (error) {
            console.error("Error loading bookings", error);
            toast.error("Impossible de charger les réservations");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><CheckCircleIcon className="w-4 h-4" /> Confirmé</span>;
            case 'pending':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"><ClockIcon className="w-4 h-4" /> En attente</span>;
            case 'cancelled':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"><XCircleIcon className="w-4 h-4" /> Annulé</span>;
            default:
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">{status}</span>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-4">
                        <TicketIcon className="w-10 h-10 text-ocean-500" />
                        Gestion des Réservations
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Suivez et gérez l'ensemble des transactions et billets.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-md">
                        <p className="text-[10px] font-black text-ocean-600 dark:text-ocean-400 uppercase tracking-widest mb-1">Total Réservations</p>
                        <p className="text-3xl font-black text-gray-900 dark:text-white">{pagination?.total || 0}</p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-white/5 p-4 rounded-[2rem] shadow-xl backdrop-blur-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group">
                    <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-ocean-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Rechercher par référence..."
                        className="w-full bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-white/10 rounded-2xl py-3.5 pl-14 pr-4 outline-none focus:ring-4 focus:ring-ocean-500/10 focus:border-ocean-500 transition-all font-medium text-sm text-gray-900 dark:text-white shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="w-full md:w-48">
                    <select
                        className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-white/5 rounded-2xl py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-ocean-500 transition-all font-medium"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="confirmed">Confirmé</option>
                        <option value="pending">En attente</option>
                        <option value="cancelled">Annulé</option>
                    </select>
                </div>

                <div className="flex items-center bg-gray-100 dark:bg-gray-900/50 rounded-2xl p-1 border border-gray-200 dark:border-white/5">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-ocean-500 text-white shadow-lg shadow-ocean-500/30' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/5'}`}
                        title="Vue Liste"
                    >
                        <TableCellsIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-ocean-500 text-white shadow-lg shadow-ocean-500/30' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/5'}`}
                        title="Vue Carte"
                    >
                        <Squares2X2Icon className="w-5 h-5" />
                    </button>
                </div>

                <button
                    onClick={() => loadBookings()}
                    className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-gray-400 hover:text-ocean-600 dark:hover:text-white transition-all hover:bg-white/10"
                >
                    <ArrowPathIcon className={`w-6 h-6 ${loading ? 'animate-spin text-ocean-500' : ''}`} />
                </button>
            </div>

            {/* Content */}
            {loading && bookings.length === 0 ? (
                <div className="py-20 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-ocean-500/20 border-t-ocean-500 rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-bold animate-pulse">Chargement des réservations...</p>
                </div>
            ) : bookings.length === 0 ? (
                <div className="py-32 text-center space-y-4 bg-white dark:bg-transparent rounded-[2.5rem] border border-gray-100 dark:border-white/5">
                    <TicketIcon className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto" />
                    <p className="text-gray-400 dark:text-gray-500 font-bold text-xl uppercase tracking-widest">Aucune réservation trouvée</p>
                </div>
            ) : viewMode === 'list' ? (
                <div className="bg-white dark:bg-gray-800/30 rounded-[2.5rem] border border-gray-200 dark:border-white/5 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Référence</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Client</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Passagers</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Voyage</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Départ</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Date</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Montant</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {bookings.map((booking) => {
                                    const isRoundTrip = booking.tickets?.some((t: any) => t.return_trip_id);
                                    const routeName = booking.trip?.route?.name ||
                                        (booking.trip?.route ? `${booking.trip.route.departure_port?.name || booking.trip.route.departurePort?.name} → ${booking.trip.route.arrival_port?.name || booking.trip.route.arrivalPort?.name}` : 'Trajet inconnu');
                                    const passengerCount = booking.tickets?.length || 0;

                                    return (
                                        <tr
                                            key={booking.id}
                                            onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                                            className="group hover:bg-ocean-50/50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                                        >
                                            <td className="px-8 py-6 font-mono font-bold text-ocean-600 dark:text-ocean-400">{booking.booking_reference}</td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                                                        <UserIcon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-gray-900 dark:text-white font-bold">{booking.user?.name || 'Invité'}</div>
                                                        <div className="text-xs text-gray-500">{booking.user?.email || '-'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-ocean-50 dark:bg-ocean-500/10 text-ocean-600 dark:text-ocean-400 font-black text-xs border border-ocean-100 dark:border-ocean-500/20">
                                                    {passengerCount}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 dark:text-white text-sm">{routeName}</span>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest inline-block px-2 py-0.5 rounded w-fit mt-1 ${isRoundTrip ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {isRoundTrip ? 'Aller-Retour' : 'Aller Simple'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                {booking.trip?.departure_time ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900 dark:text-white">
                                                            {new Date(booking.trip.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">{booking.trip?.ship?.name || 'Navire assigné'}</span>
                                                    </div>
                                                ) : <span className="text-gray-400 italic text-xs">--:--</span>}
                                            </td>
                                            <td className="px-8 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                                {booking.trip?.departure_time ? new Date(booking.trip.departure_time).toLocaleDateString() : new Date(booking.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-6 text-right font-black text-gray-900 dark:text-white">
                                                {booking.total_amount.toLocaleString()} FCFA
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                {getStatusBadge(booking.status)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="group relative bg-white dark:bg-gray-800/30 backdrop-blur-md rounded-[2rem] p-6 border border-gray-200 dark:border-white/5 hover:border-ocean-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-ocean-500/10 hover:-translate-y-1 shadow-lg">
                            <div className="flex justify-between items-start mb-6">
                                <span className="font-mono text-sm font-black text-ocean-600 dark:text-ocean-400 bg-ocean-50 dark:bg-ocean-500/10 px-3 py-1 rounded-lg border border-ocean-100 dark:border-ocean-500/20">
                                    {booking.booking_reference}
                                </span>
                                {getStatusBadge(booking.status)}
                            </div>

                            <div className="mb-6 space-y-1">
                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Client</p>
                                <div className="flex items-center gap-2">
                                    <UserIcon className="w-5 h-5 text-gray-400" />
                                    <span className="text-gray-900 dark:text-white font-bold text-lg">{booking.user?.name || 'Invité'}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 border border-gray-100 dark:border-white/5">
                                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Montant</p>
                                    <p className="text-gray-900 dark:text-white font-black">{booking.total_amount.toLocaleString()} FCFA</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 border border-gray-100 dark:border-white/5">
                                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Passagers</p>
                                    <p className="text-gray-900 dark:text-white font-black">{booking.tickets?.length || 0} pers.</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 border border-gray-100 dark:border-white/5">
                                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Date</p>
                                    <p className="text-gray-900 dark:text-white font-bold text-sm">{new Date(booking.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                                className="w-full py-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-ocean-500 hover:text-white text-sm font-bold text-gray-700 dark:text-white transition-all border border-gray-100 dark:border-white/10 group-hover:border-ocean-500/50"
                            >
                                Voir Détails
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex justify-between items-center shadow-lg backdrop-blur-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Affichage de {bookings.length} sur {pagination.total}
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-xs font-black text-gray-700 dark:text-white disabled:opacity-30 transition hover:bg-ocean-500 hover:text-white"
                        >
                            Précédent
                        </button>
                        <button
                            disabled={page === pagination.last_page}
                            onClick={() => setPage(page + 1)}
                            className="px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-xs font-black text-gray-700 dark:text-white disabled:opacity-30 transition hover:bg-ocean-500 hover:text-white"
                        >
                            Suivant
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
