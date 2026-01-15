import { useState, useEffect } from 'react';
import {
    BanknotesIcon,
    TicketIcon,
    UserGroupIcon,
    ArrowPathIcon,
    LockClosedIcon,
    ExclamationTriangleIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface DashboardStats {
    overview: {
        total_revenue: number;
        total_tickets: number;
        active_cash_desks: number;
    };
    chart_data: Array<{ hour: number; total: number }>;
}

interface CashDesk {
    id: number;
    name: string;
    status: 'open' | 'closed';
    port: string;
    current_session: {
        id: number;
        cashier_name: string;
        opened_at: string;
        current_total: number;
    } | null;
}

export default function SupervisorDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [cashDesks, setCashDesks] = useState<CashDesk[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            const [statsData, cashDesksData] = await Promise.all([
                apiService.getSupervisorDashboard(),
                apiService.getSupervisorCashDesks()
            ]);
            setStats(statsData);
            setCashDesks(cashDesksData);
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors du chargement des données");
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
        toast.success("Données actualisées");
    };

    const handleCloseCashDesk = async (id: number, name: string) => {
        if (!window.confirm(`Êtes-vous sûr de vouloir fermer administrativement le guichet "${name}" ?\nCette action est irréversible.`)) {
            return;
        }

        try {
            await apiService.closeCashDeskRemotely(id);
            toast.success(`Guichet ${name} fermé avec succès`);
            loadData();
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la fermeture du guichet");
        }
    };

    useEffect(() => {
        loadData().then(() => setLoading(false));

        // Auto-refresh every 30 seconds
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
                        Supervision <span className="text-indigo-600">Gare</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Vue d'ensemble et contrôle opérationnel</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-5 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-300 hover:text-indigo-600 rounded-2xl font-bold transition-all disabled:opacity-50"
                    >
                        <ArrowPathIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                        <span className="uppercase text-xs tracking-wider">Actualiser</span>
                    </button>
                    <div className="px-5 py-3 bg-emerald-500/10 text-emerald-600 rounded-2xl font-bold flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="uppercase text-xs tracking-wider">Temps Réel</span>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Revenue Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                                <BanknotesIcon className="w-8 h-8 text-white" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest opacity-80 bg-black/20 px-3 py-1 rounded-full">Aujourd'hui</span>
                        </div>
                        <div className="space-y-1">
                            <div className="text-4xl font-black tracking-tighter tabular-nums">
                                {stats?.overview.total_revenue.toLocaleString()} <span className="text-sm opacity-60 font-medium">CFA</span>
                            </div>
                            <div className="text-sm font-bold opacity-80 uppercase tracking-widest">Chiffre d'Affaires</div>
                        </div>
                    </div>
                </div>

                {/* Tickets Card */}
                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-2xl">
                            <TicketIcon className="w-8 h-8 text-rose-500" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">
                            {stats?.overview.total_tickets}
                        </div>
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Billets Vendus</div>
                    </div>
                </div>

                {/* Active Desks Card */}
                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                            <UserGroupIcon className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Actifs</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">
                            {stats?.overview.active_cash_desks} <span className="text-xl text-slate-300">/ {cashDesks.length}</span>
                        </div>
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Guichets Ouverts</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-700 shadow-sm h-[400px] flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                        <ChartBarIcon className="w-6 h-6 text-indigo-600" />
                        <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Évolution des Ventes (Heure)</h3>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.chart_data || []}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                <XAxis
                                    dataKey="hour"
                                    tickFormatter={(hour) => `${hour}h`}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        borderRadius: '1rem',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}
                                    itemStyle={{ color: '#fff', fontWeight: 600, fontSize: '12px' }}
                                    labelStyle={{ color: '#94a3b8', marginBottom: '0.25rem', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                    formatter={(value: any) => [
                                        typeof value === 'number' ? `${value.toLocaleString()} CFA` : `${value} CFA`,
                                        'Ventes'
                                    ]}
                                    labelFormatter={(hour) => `${hour}h00 - ${Number(hour) + 1}h00`}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#4f46e5"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Cash Desks List */}
                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <BanknotesIcon className="w-6 h-6 text-slate-900 dark:text-white" />
                            <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">État des Guichets</h3>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        {cashDesks.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                                <ExclamationTriangleIcon className="w-12 h-12 mb-3" />
                                <p className="text-xs font-black uppercase tracking-widest">Aucun guichet configuré</p>
                            </div>
                        ) : (
                            cashDesks.map(desk => (
                                <div key={desk.id} className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700 hover:border-indigo-500/30 transition-all group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-black text-sm text-slate-900 dark:text-white">{desk.name}</h4>
                                            <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">{desk.port}</p>
                                        </div>
                                        <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${desk.status === 'open'
                                            ? 'bg-emerald-500/10 text-emerald-600'
                                            : 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-300'
                                            }`}>
                                            {desk.status === 'open' ? 'OUVERT' : 'FERMÉ'}
                                        </div>
                                    </div>

                                    {desk.status === 'open' && desk.current_session ? (
                                        <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-600/50">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500 font-medium">Caissier</span>
                                                <span className="font-bold text-slate-800 dark:text-white">{desk.current_session.cashier_name}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500 font-medium">Ouvert à</span>
                                                <span className="font-mono font-medium text-slate-600 dark:text-slate-300">
                                                    {new Date(desk.current_session.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => handleCloseCashDesk(desk.current_session!.id, desk.name)}
                                                className="w-full mt-2 py-2 flex items-center justify-center gap-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl transition-colors text-[10px] font-black uppercase tracking-widest"
                                            >
                                                <LockClosedIcon className="w-3 h-3" />
                                                Fermeture Forcée
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="pt-3 border-t border-slate-200 dark:border-slate-600/50 text-center">
                                            <span className="text-[10px] font-medium text-slate-400 italic">En attente d'ouverture</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
