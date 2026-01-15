import { useState, useEffect } from 'react';
import {
    BanknotesIcon,
    UserGroupIcon,
    TicketIcon,
    LifebuoyIcon,
    ChevronRightIcon,
    ArrowPathIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import StatCard from '../../components/StatCard';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';
import CashierDashboard from './CashierDashboard';

interface StatItem {
    name: string;
    value: string;
    icon: React.ElementType;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
    color: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<StatItem[]>([
        { name: "Chiffre d'Affaires", value: 'Chargement...', icon: BanknotesIcon, change: '0%', changeType: 'neutral', color: 'from-green-500 to-emerald-500' },
        { name: 'Réservations (Jour)', value: 'Chargement...', icon: TicketIcon, change: '0%', changeType: 'neutral', color: 'from-blue-500 to-indigo-500' },
        { name: 'Nouveaux Clients', value: 'Chargement...', icon: UserGroupIcon, change: '0%', changeType: 'neutral', color: 'from-purple-500 to-pink-500' },
        { name: 'Taux Remplissage', value: 'Chargement...', icon: LifebuoyIcon, change: '0%', changeType: 'neutral', color: 'from-orange-500 to-red-500' },
    ]);
    const [recentBookings, setRecentBookings] = useState<any[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const loadStats = async () => {
            const start = performance.now();
            try {
                const statsData = await apiService.getDashboardStats();
                const totalTime = Math.round(performance.now() - start);
                console.log(`📈 [Stats] Reçu en ${totalTime}ms (Interne Backend: ${statsData.internal_time_ms}ms, Source: ${statsData.source})`);

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
                        name: 'Réservations (Jour)',
                        value: statsData.bookings_today.toString(),
                        icon: TicketIcon,
                        change: `${statsData.bookings_change > 0 ? '+' : ''}${statsData.bookings_change}%`,
                        changeType: statsData.bookings_change > 0 ? 'positive' : statsData.bookings_change < 0 ? 'negative' : 'neutral',
                        color: 'from-blue-500 to-indigo-500'
                    },
                    {
                        name: 'Nouveaux Clients (Jour)',
                        value: statsData.new_clients_today.toString(),
                        icon: UserGroupIcon,
                        change: 'Aujourd\'hui',
                        changeType: 'neutral',
                        color: 'from-purple-500 to-pink-500'
                    },
                    {
                        name: 'Taux Remplissage (Jour)',
                        value: `${statsData.fill_rate_today}%`,
                        icon: LifebuoyIcon,
                        change: 'Moyenne',
                        changeType: 'neutral',
                        color: 'from-orange-500 to-red-500'
                    },
                ]);
            } catch (err: any) {
                console.error("❌ Stats error:", err);
            }
        };

        const loadRecentBookings = async () => {
            const start = performance.now();
            try {
                setLoadingBookings(true);
                const bookingsData = await apiService.getAdminBookings({ page: 1, limit: 5 });
                console.log(`📑 [Bookings] Reçu en ${Math.round(performance.now() - start)}ms`);
                console.log('📦 [Bookings] Raw data:', bookingsData);

                // Laravel pagination returns: { data: { data: [...], current_page, ... } }
                let data = [];
                if (bookingsData?.data?.data && Array.isArray(bookingsData.data.data)) {
                    data = bookingsData.data.data;
                } else if (Array.isArray(bookingsData?.data)) {
                    data = bookingsData.data;
                } else if (Array.isArray(bookingsData)) {
                    data = bookingsData;
                }

                console.log('📋 [Bookings] Extracted bookings:', data.length, 'items');
                setRecentBookings(data.slice(0, 5));
            } catch (err) {
                console.error("❌ Bookings error:", err);
                setRecentBookings([]);
            } finally {
                setLoadingBookings(false);
            }
        };


        if (user?.role && user.role !== 'guichetier') {
            console.log("📊 [Dashboard] Initialisation du chargement...");
            loadStats();

            const timer = setTimeout(() => {
                loadRecentBookings();
            }, 800);

            return () => clearTimeout(timer);
        }
    }, [user]);

    if (user?.role === 'guichetier') {
        return <CashierDashboard />;
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header section with glow */}
            <div className="relative">
                <div className="absolute -left-4 -top-4 w-64 h-64 bg-ocean-500/20 rounded-full blur-[100px] pointer-events-none"></div>
                <h1 className="relative text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Tableau de bord
                </h1>
                <p className="relative mt-2 text-gray-500 dark:text-gray-400">
                    Vue d'ensemble de l'activité maritime et commerciale.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((item) => (
                    <StatCard key={item.name} {...item} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Bookings - 2/3 width */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Réservations récentes</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Dernières ventes enregistrées</p>
                            </div>
                            <button className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl text-gray-400 hover:text-ocean-500 transition-colors">
                                <ArrowPathIcon className={`w-5 h-5 ${loadingBookings ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        <div className="space-y-4 relative z-10">
                            {loadingBookings ? (
                                Array(5).fill(0).map((_, i) => (
                                    <div key={i} className="h-24 bg-gray-50 dark:bg-gray-700/30 rounded-3xl animate-pulse"></div>
                                ))
                            ) : recentBookings.length > 0 ? (
                                recentBookings.map((booking: any) => (
                                    <div key={booking.id} className="flex items-center justify-between p-5 rounded-3xl border border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all hover:scale-[1.01] group/item border-l-4 border-l-transparent hover:border-l-ocean-500">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ocean-50 to-ocean-100 dark:from-ocean-900/30 dark:to-ocean-800/30 flex items-center justify-center text-ocean-600 dark:text-ocean-400 font-black text-xl shadow-inner">
                                                {booking.user?.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-gray-900 dark:text-white group-hover/item:text-ocean-600 transition-colors text-lg">
                                                    {booking.user?.name || 'Client Inconnu'}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-lg">
                                                        {format(new Date(booking.created_at), 'HH:mm', { locale: fr })}
                                                    </span>
                                                    <span className="text-xs font-black text-ocean-600 dark:text-ocean-400 tracking-wider">
                                                        #{booking.reference}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-black text-gray-900 dark:text-white">
                                                {booking.total_amount.toLocaleString()} <span className="text-xs text-gray-400 font-bold ml-1">FCFA</span>
                                            </div>
                                            <div className={`mt-2 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block ${booking.status === 'confirmed'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                                }`}>
                                                {booking.status === 'confirmed' ? 'Confirmé' : booking.status}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                        <TicketIcon className="w-10 h-10" />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 font-bold">Aucune réservation récente.</p>
                                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Les nouvelles réservations apparaîtront ici.</p>
                                </div>
                            )}

                        </div>

                        <button className="w-full mt-8 py-5 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-3xl text-gray-400 font-black hover:border-ocean-300 hover:text-ocean-500 hover:bg-ocean-50/50 dark:hover:bg-ocean-900/10 transition-all uppercase tracking-widest text-xs">
                            Voir toutes les réservations
                        </button>
                    </div>
                </div>

                {/* Right side actions - 1/3 width */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-ocean-600 to-ocean-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-ocean-200 dark:shadow-none relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <h2 className="text-xl font-black mb-2 tracking-tight">Actions rapides</h2>
                        <p className="text-ocean-100 text-sm font-medium mb-8 leading-relaxed">Gérez vos opérations quotidiennes en un clic.</p>

                        <div className="space-y-4">
                            <button className="w-full p-5 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-between transition-all group/btn border border-white/5">
                                <span className="font-bold tracking-wide">Nouveau Trajet</span>
                                <ChevronRightIcon className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                            <button className="w-full p-5 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-between transition-all group/btn border border-white/5">
                                <span className="font-bold tracking-wide">Gérer les Navires</span>
                                <ChevronRightIcon className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                            <div className="p-1 px-1 bg-white/5 rounded-2xl border border-white/10">
                                <button className="w-full p-4 bg-white text-ocean-600 rounded-xl flex items-center justify-between shadow-lg transform hover:scale-[1.02] transition-all">
                                    <span className="font-black italic tracking-tighter">POINT DE VENTE</span>
                                    <div className="px-2 py-1 bg-ocean-600 text-white text-[9px] font-black rounded-lg uppercase">Activé</div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">État des Ports</h2>
                        <div className="space-y-8">
                            {[
                                { name: 'Dakar', status: 'Ouvert', load: 'Élevé', color: 'bg-green-500' },
                                { name: 'Gorée', status: 'Ouvert', load: 'Normal', color: 'bg-green-500' }
                            ].map((port) => (
                                <div key={port.name} className="flex items-center justify-between group/port">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center group-hover/port:bg-ocean-50 dark:group-hover/port:bg-ocean-900/30 transition-colors">
                                            <MapPinIcon className="w-6 h-6 text-gray-400 group-hover/port:text-ocean-500 transition-colors" />
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 dark:text-white text-base tracking-tight">{port.name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-0.5">{port.load}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 justify-end mb-1">
                                            <span className={`w-2 h-2 rounded-full ${port.color} animate-pulse`}></span>
                                            <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tighter">{port.status}</span>
                                        </div>
                                        <div className="w-16 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div className={`h-full ${port.load === 'Élevé' ? 'w-4/5 bg-ocean-500' : 'w-1/3 bg-green-500'}`}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
