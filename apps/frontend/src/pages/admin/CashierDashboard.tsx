import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
    BanknotesIcon,
    TicketIcon,
    BuildingStorefrontIcon,
    ClockIcon,
    ChevronRightIcon,
    XMarkIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import type { Trip } from '../../services/api';
import StatCard from '../../components/StatCard';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface StatItem {
    name: string;
    value: string;
    icon: React.ElementType;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
    color: string;
}

export default function CashierDashboard() {
    const [stats, setStats] = useState<StatItem[]>([
        { name: "Chiffre d'Affaires (Jour)", value: 'Chargement...', icon: BanknotesIcon, change: '0%', changeType: 'neutral', color: 'from-green-500 to-emerald-500' },
        { name: 'Ventes (Jour)', value: 'Chargement...', icon: TicketIcon, change: '0%', changeType: 'neutral', color: 'from-blue-500 to-indigo-500' },
    ]);
    const [sessionStatus, setSessionStatus] = useState<any>(null);
    const [cashDesk, setCashDesk] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [isTripModalOpen, setIsTripModalOpen] = useState(false);
    const [todayTrips, setTodayTrips] = useState<Trip[]>([]);
    const [loadingTrips, setLoadingTrips] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [statsData, sessionData] = await Promise.all([
                apiService.getCashierDashboardStats(),
                apiService.getPosSessionStatus()
            ]);

            setStats([
                {
                    name: "Chiffre d'Affaires (Jour)",
                    value: `${Math.round(statsData.revenue_today).toLocaleString()} FCFA`,
                    icon: BanknotesIcon,
                    change: `${statsData.revenue_change > 0 ? '+' : ''}${statsData.revenue_change}%`,
                    changeType: statsData.revenue_change > 0 ? 'positive' : statsData.revenue_change < 0 ? 'negative' : 'neutral',
                    color: 'from-green-500 to-emerald-500'
                },
                {
                    name: 'Ventes (Jour)',
                    value: statsData.bookings_today.toString(),
                    icon: TicketIcon,
                    change: `${statsData.bookings_change > 0 ? '+' : ''}${statsData.bookings_change}%`,
                    changeType: statsData.bookings_change > 0 ? 'positive' : statsData.bookings_change < 0 ? 'negative' : 'neutral',
                    color: 'from-blue-500 to-indigo-500'
                }
            ]);

            setSessionStatus(sessionData.session);
            setCashDesk(statsData.cash_desk);
        } catch (err) {
            console.error("❌ Cashier Dashboard error:", err);
        } finally {
            setLoading(false);
        }
    };

    const loadTodayTrips = async () => {
        if (!cashDesk?.port_id) return;
        setLoadingTrips(true);
        try {
            const response = await apiService.getAdminTrips({
                departure_port_id: cashDesk.port_id,
                status: 'scheduled'
            });
            // Filter trips only for today in JS if API doesn't support date filtering easily
            const todayStr = format(new Date(), 'yyyy-MM-dd');
            const data = Array.isArray(response.data) ? response.data : [];
            const filtered = data.filter((t: any) => t.departure_time.startsWith(todayStr));
            setTodayTrips(filtered);
        } catch (err) {
            console.error("❌ Stats trips error:", err);
        } finally {
            setLoadingTrips(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (isTripModalOpen) {
            loadTodayTrips();
        }
    }, [isTripModalOpen]);

    const isAssigned = !!cashDesk;

    return (
        <div className="space-y-8 pb-12">
            <div className="relative">
                <div className="absolute -left-4 -top-4 w-64 h-64 bg-ocean-500/20 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="flex items-center justify-between relative">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                            Espace Guichetier
                        </h1>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                            Bienvenue, voici un résumé de votre activité de caisse pour aujourd'hui.
                        </p>
                    </div>
                    {isAssigned && (
                        <div className="flex flex-col items-end">
                            <span className="flex items-center gap-2 px-4 py-2 bg-ocean-50 dark:bg-ocean-900/30 text-ocean-600 dark:text-ocean-400 rounded-2xl text-sm font-bold border border-ocean-100 dark:border-ocean-800">
                                <BuildingStorefrontIcon className="w-4 h-4" />
                                {cashDesk.name}
                            </span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2 mr-2">
                                Port: {cashDesk.port?.name || 'Non défini'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats.map((item) => (
                    <StatCard key={item.name} {...item} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
                        {!isAssigned && !loading && (
                            <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-8 text-center">
                                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                                    <XMarkIcon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Aucun guichet assigné</h3>
                                <p className="text-sm text-gray-500 mt-2 max-w-xs">
                                    Vous n'avez pas de guichet assigné. Veuillez contacter un administrateur pour commencer à vendre.
                                </p>
                            </div>
                        )}

                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Session de Caisse</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Statut actuel de votre point de vente</p>
                            </div>
                            <div className={`px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest ${sessionStatus ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {sessionStatus ? 'Session Ouverte' : 'Caisse Fermée'}
                            </div>
                        </div>

                        {sessionStatus ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-3xl border border-gray-100 dark:border-gray-700/50">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ouverte à</p>
                                        <p className="text-xl font-black text-gray-900 dark:text-white">
                                            {format(new Date(sessionStatus.opened_at), 'HH:mm', { locale: fr })}
                                        </p>
                                    </div>
                                    <div className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-3xl border border-gray-100 dark:border-gray-700/50">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Montant Attendu</p>
                                        <p className="text-xl font-black text-ocean-600">
                                            {Number(sessionStatus.expected_amount).toLocaleString()} <span className="text-xs font-bold text-gray-400 ml-1">FCFA</span>
                                        </p>
                                    </div>
                                </div>
                                <Link to="/admin/pos" className="block w-full py-5 bg-ocean-600 hover:bg-ocean-700 text-white rounded-3xl text-center font-black uppercase tracking-widest text-sm shadow-xl shadow-ocean-200 dark:shadow-none transition-all">
                                    Accéder au Point de Vente
                                </Link>
                            </div>
                        ) : (
                            <div className="text-center py-12 space-y-6">
                                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                                    <ClockIcon className="w-10 h-10" />
                                </div>
                                <div>
                                    <p className="text-gray-900 dark:text-white font-black">Aucune session active</p>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Vous devez ouvrir votre caisse pour commencer les ventes.</p>
                                </div>
                                <Link
                                    to="/admin/pos"
                                    className={`inline-block px-10 py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs ${!isAssigned ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                                >
                                    Ouvrir ma caisse
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-ocean-600 to-ocean-700 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
                        <h2 className="text-xl font-black mb-2 tracking-tight">Vente Express</h2>
                        <p className="text-ocean-100 text-sm font-medium mb-8">Lancez une nouvelle transaction rapidement.</p>

                        <Link
                            to="/admin/pos"
                            className={`w-full p-5 bg-white text-ocean-600 rounded-2xl flex items-center justify-between shadow-lg transform hover:scale-[1.02] transition-all ${!isAssigned ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                        >
                            <span className="font-black italic tracking-tighter">POINT DE VENTE</span>
                            <ChevronRightIcon className="w-5 h-5" />
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Liens Utiles</h2>
                        <div className="space-y-3">
                            <Link
                                to="/admin/bookings"
                                className={`flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700 ${!isAssigned ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                            >
                                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Historique Ventes</span>
                                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                            </Link>
                            <button
                                onClick={() => setIsTripModalOpen(true)}
                                disabled={!isAssigned}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Horaires Voyages</span>
                                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Horaires */}
            <Transition.Root show={isTripModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={setIsTripModalOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="transition ease-out duration-300 transform"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="transition ease-in duration-200 transform"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-[3rem] bg-white dark:bg-gray-800 p-10 text-left align-middle shadow-2xl transition-all border border-white/10 relative">
                                    <div className="absolute top-8 right-8">
                                        <button onClick={() => setIsTripModalOpen(false)} className="p-3 bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-red-500 rounded-2xl transition-all">
                                            <XMarkIcon className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="mb-10">
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="p-3 bg-ocean-100 dark:bg-ocean-900/30 text-ocean-600 dark:text-ocean-400 rounded-2xl">
                                                <CalendarIcon className="w-6 h-6" />
                                            </div>
                                            <Dialog.Title as="h3" className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                                Horaires de la Journée
                                            </Dialog.Title>
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                                            Départs programmés depuis le port de <span className="text-ocean-600 font-bold">{cashDesk?.port?.name}</span> aujourd'hui.
                                        </p>
                                    </div>

                                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                                        {loadingTrips ? (
                                            Array(3).fill(0).map((_, i) => (
                                                <div key={i} className="h-28 bg-gray-50 dark:bg-gray-700/30 rounded-3xl animate-pulse"></div>
                                            ))
                                        ) : todayTrips.length > 0 ? (
                                            todayTrips.map((trip) => (
                                                <div key={trip.id} className="group p-6 rounded-3xl border border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-6">
                                                            <div className="text-center">
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">DÉPART</p>
                                                                <p className="text-2xl font-black text-gray-900 dark:text-white">
                                                                    {format(new Date(trip.departure_time), 'HH:mm')}
                                                                </p>
                                                            </div>
                                                            <div className="w-px h-10 bg-gray-100 dark:bg-gray-700"></div>
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-xs font-black text-ocean-600 uppercase tracking-tighter">Vers</span>
                                                                    <p className="font-bold text-gray-900 dark:text-white">{trip.route?.arrival_port?.name}</p>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-[10px] font-black bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                                                                        {trip.ship?.name}
                                                                    </span>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{trip.status}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Places disponibles</p>
                                                            <div className="flex items-end gap-1">
                                                                <p className="text-2xl font-black text-gray-900 dark:text-white">{trip.available_seats_pax}</p>
                                                                <p className="text-xs font-bold text-gray-400 mb-1">/ {trip.ship?.capacity_pax}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-20 bg-gray-50 dark:bg-gray-700/20 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-700">
                                                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                    <ClockIcon className="w-8 h-8 text-gray-300" />
                                                </div>
                                                <p className="text-gray-500 dark:text-gray-400 font-bold">Aucun autre trajet prévu pour aujourd'hui.</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-10 flex justify-end">
                                        <button
                                            type="button"
                                            className="px-8 py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform"
                                            onClick={() => setIsTripModalOpen(false)}
                                        >
                                            Fermer
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </div>
    );
}
