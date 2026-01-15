import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiService } from '../../../services/api';
import type { Trip } from '../../../services/api';
import {
    PlusIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    TableCellsIcon,
    Squares2X2Icon,
    ArrowDownTrayIcon,
    CalendarIcon,
    MapIcon,
    LifebuoyIcon,
    TicketIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export default function ListTrips() {
    const { user } = useAuth();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [allRoutes, setAllRoutes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const userId = searchParams.get('userId');

    // UI States
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [routeFilter, setRouteFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTrips, setTotalTrips] = useState(0);

    useEffect(() => {
        loadInitialData();

        // Real-time polling: Refresh data every 15 seconds
        const pollInterval = setInterval(() => {
            loadTrips(false); // background load
        }, 15000);

        return () => clearInterval(pollInterval);
    }, []);

    useEffect(() => {
        loadTrips(true); // explicit filter load
    }, [statusFilter, routeFilter, currentPage, searchQuery]);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const routesData = await apiService.getAdminRoutes();
            setAllRoutes(routesData.data || routesData);
            await loadTrips();
        } catch (error) {
            console.error("Failed to load initial data", error);
        } finally {
            setLoading(false);
        }
    };

    const loadTrips = async (showLoading = true) => {
        if (showLoading) setLoading(true); // Only show spinner on manual filters
        try {
            const data = await apiService.getAdminTrips({
                status: statusFilter,
                route_id: routeFilter,
                page: currentPage,
                search: searchQuery
            });
            setTrips(data.data || []);
            if (data.meta) {
                setTotalPages(data.meta.last_page);
                setTotalTrips(data.meta.total);
            }
        } catch (error) {
            console.error("Failed to load trips", error);
            if (showLoading) toast.error("Impossible de charger les voyages.");
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce voyage ?')) {
            try {
                await apiService.deleteTrip(id);
                toast.success("Voyage supprimé");
                loadTrips();
            } catch (error) {
                console.error("Failed to delete trip", error);
                toast.error("Erreur lors de la suppression.");
            }
        }
    };

    const handleExport = () => {
        const headers = ['ID', 'Route', 'Navire', 'Départ', 'Arrivée', 'Statut', 'Prix Adulte'];
        const csvContent = [
            headers.join(','),
            ...trips.map(t => [
                t.id,
                `"${t.route?.name || 'N/A'}"`,
                `"${t.ship?.name || 'N/A'}"`,
                t.departure_time,
                t.arrival_time,
                t.status,
                // Accessing legacy price field for simple export, or extraction from pricing_settings could be done here
                'N/A'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `voyages_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        toast.success("Exportation réussie !");
    };

    // Simplified because we use server-side pagination now
    const paginatedTrips = trips;

    const getEffectiveStatus = (trip: Trip) => {
        const now = new Date();
        const departure = new Date(trip.departure_time);

        if (trip.status === 'scheduled' && now > departure) {
            return 'departed';
        }
        return trip.status;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'boarding': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'departed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'arrived': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: { [key: string]: string } = {
            scheduled: 'Programmé',
            boarding: 'Embarquement',
            departed: 'En mer',
            arrived: 'Arrivé',
            cancelled: 'Annulé'
        };
        return labels[status] || status;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in p-4 lg:p-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-ocean-900 to-ocean-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-ocean-500/10 rounded-full -ml-24 -mb-24 blur-2xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                            <CalendarIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight">Gestion des Voyages</h1>
                            <p className="text-ocean-200 font-medium">Planifiez et gérez les traversées maritimes</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 relative z-10">
                    <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center relative group">
                        <div className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </div>
                        <p className="text-[10px] font-black text-ocean-300 uppercase tracking-widest mb-1">Direct</p>
                        <p className="text-2xl font-black">{totalTrips}</p>
                    </div>
                    {(user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager') && (
                        <Link
                            to="/admin/trips/create"
                            className="flex items-center gap-3 bg-white text-ocean-900 px-8 py-4 rounded-2xl font-black hover:bg-ocean-50 transition-all duration-300 shadow-xl hover:scale-105"
                        >
                            <PlusIcon className="w-6 h-6" />
                            Nouveau Voyage
                        </Link>
                    )}
                    <button
                        onClick={handleExport}
                        className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20 transition-all"
                    >
                        <ArrowDownTrayIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Filters & Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-gray-800/50 backdrop-blur-md p-6 rounded-3xl border border-gray-200 dark:border-white/5 shadow-xl">
                <div className="flex flex-col md:flex-row gap-4 flex-1">
                    <div className="relative flex-1 group">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-ocean-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Rechercher un voyage..."
                            className="w-full bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-4 focus:ring-ocean-500/10 focus:border-ocean-500 transition-all font-medium text-sm text-gray-900 dark:text-white"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    <div className="flex gap-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-ocean-500 outline-none text-sm font-bold min-w-[150px]"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="scheduled">Programmés</option>
                            <option value="boarding">Embarquement</option>
                            <option value="departed">Partis</option>
                            <option value="arrived">Arrivés</option>
                            <option value="cancelled">Annulés</option>
                        </select>
                        <select
                            value={routeFilter}
                            onChange={(e) => setRouteFilter(e.target.value)}
                            className="px-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-ocean-500 outline-none text-sm font-bold min-w-[180px]"
                        >
                            <option value="all">Tous les trajets</option>
                            {allRoutes.map((route: any) => (
                                <option key={route.id} value={route.id}>{route.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900/50 p-1.5 rounded-2xl border border-gray-200 dark:border-white/10">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-lg text-ocean-600 dark:text-white' : 'text-gray-500 hover:text-gray-700'} `}
                    >
                        <TableCellsIcon className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-lg text-ocean-600 dark:text-white' : 'text-gray-500 hover:text-gray-700'} `}
                    >
                        <Squares2X2Icon className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {viewMode === 'list' ? (
                <div className="overflow-hidden shadow-2xl rounded-[2rem] bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-white/5 backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900/50">
                                    <th className="px-6 py-5 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Trajet & Ports</th>
                                    <th className="px-6 py-5 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Navire</th>
                                    <th className="px-6 py-5 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Horaires</th>
                                    <th className="px-6 py-5 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Statut</th>
                                    <th className="px-6 py-5 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Capacité</th>
                                    <th className="px-6 py-5 text-right text-xs font-black text-gray-500 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {paginatedTrips.map((trip) => (
                                    <tr key={trip.id} className="hover:bg-ocean-50/30 dark:hover:bg-ocean-900/10 transition-colors group">
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="p-1.5 bg-ocean-100 dark:bg-ocean-900/30 rounded-lg">
                                                        <MapIcon className="w-5 h-5 text-ocean-600" />
                                                    </div>
                                                    <span className="font-black text-gray-900 dark:text-white">{trip.route?.name}</span>
                                                </div>
                                                <div className="text-xs text-gray-500 ml-9 flex items-center gap-2">
                                                    <span>{trip.route?.departure_port?.name}</span>
                                                    <span className="text-ocean-300">→</span>
                                                    <span>{trip.route?.arrival_port?.name}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                                                    <LifebuoyIcon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 dark:text-white">{trip.ship?.name}</div>
                                                    <div className="text-xs text-gray-500">{trip.ship?.type}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {new Date(trip.departure_time).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                                </span>
                                                <span className="text-xl font-black text-ocean-600">
                                                    {new Date(trip.departure_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${getStatusColor(trip.status)}`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse"></span>
                                                {getStatusLabel(trip.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 font-bold text-gray-900 dark:text-white">
                                            {trip.available_seats_pax} / {trip.ship?.capacity_pax}
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className={`flex justify-end gap-2 transition-opacity ${userId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                {userId && (
                                                    <Link
                                                        to={`/reserver?trip=${trip.id}&userId=${userId}`}
                                                        className="px-4 py-2 bg-ocean-100 text-ocean-700 rounded-xl hover:bg-ocean-600 hover:text-white transition-all text-sm font-black uppercase tracking-widest whitespace-nowrap shadow-sm"
                                                    >
                                                        Réserver
                                                    </Link>
                                                )}
                                                {(user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager') && (
                                                    <button
                                                        onClick={() => handleDelete(trip.id as any)}
                                                        className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {paginatedTrips.map((trip) => {
                        const effectiveStatus = getEffectiveStatus(trip);
                        return (
                            <div key={trip.id} className="group bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-white/5">
                                <div className="relative h-44 overflow-hidden">
                                    {trip.images && trip.images.length > 0 ? (
                                        <img
                                            src={`${import.meta.env.VITE_API_URL}/storage/${trip.images[0]}`}
                                            alt={trip.route?.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-ocean-600 to-ocean-800 p-6 flex flex-col justify-end">
                                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                                <LifebuoyIcon className="w-32 h-32" />
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                                        <div className="flex items-center gap-2 text-white/70 text-[10px] font-black uppercase tracking-widest mb-1">
                                            <span>{trip.route?.departure_port?.name}</span>
                                            <span className="text-ocean-400">→</span>
                                            <span>{trip.route?.arrival_port?.name}</span>
                                        </div>
                                        <h3 className="text-xl font-black text-white leading-tight">{trip.route?.name}</h3>
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl border border-white/10 backdrop-blur-md ${getStatusColor(effectiveStatus)}`}>
                                            {getStatusLabel(effectiveStatus)}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-ocean-50 dark:bg-ocean-900/30 rounded-xl">
                                                <CalendarIcon className="w-5 h-5 text-ocean-600" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Départ</p>
                                                <p className="font-bold text-gray-900 dark:text-white">
                                                    {new Date(trip.departure_time).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-ocean-600">
                                                {new Date(trip.departure_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>

                                    {userId ? (
                                        <Link
                                            to={`/reserver?trip=${trip.id}&userId=${userId}`}
                                            className="w-full py-4 mt-2 bg-ocean-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-ocean-600/20 hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            <TicketIcon className="w-4 h-4" />
                                            Réserver pour ce client
                                        </Link>
                                    ) : (
                                        <div className="pt-4 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <LifebuoyIcon className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-bold text-gray-600 dark:text-gray-300 truncate max-w-[120px]">{trip.ship?.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded ${trip.available_seats_pax < 10 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                                                    {trip.available_seats_pax} / {trip.ship?.capacity_pax} places
                                                </span>
                                                {(user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager') && (
                                                    <button
                                                        onClick={() => handleDelete(trip.id as any)}
                                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            <div className="flex justify-center mt-12 bg-white dark:bg-gray-800/50 p-2 rounded-3xl border border-gray-200 dark:border-white/5 inline-flex mx-auto shadow-xl">
                <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-12 h-12 rounded-2xl font-black text-sm transition-all ${currentPage === i + 1
                                ? 'bg-ocean-600 text-white shadow-lg shadow-ocean-500/30 scale-110 z-10'
                                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

