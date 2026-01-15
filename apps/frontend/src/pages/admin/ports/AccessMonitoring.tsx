import { useState, useEffect, useRef } from 'react';
import { apiService } from '../../../services/api';
import {
    SignalIcon,
    CheckCircleIcon,
    XCircleIcon,
    UserIcon,
    IdentificationIcon,
    TicketIcon,

    ChartBarIcon,

    BoltIcon
} from '@heroicons/react/24/outline';

interface AccessLog {
    id: string;
    result: 'granted' | 'denied';
    scanned_at: string;
    deny_reason?: string;
    direction: string;
    subscription?: {
        user: { name: string };
        plan: { name: string };
    };
    ticket?: {
        passenger_name: string;
        booking: { booking_reference: string };
        trip: { route: { name: string } };
    };
    device?: { name: string; location: string };
}

export default function AccessMonitoring() {
    const [logs, setLogs] = useState<AccessLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAutoRefresh, setIsAutoRefresh] = useState(true);
    const [filter, setFilter] = useState<'all' | 'granted' | 'denied'>('all');
    const [stats, setStats] = useState({
        total: 0,
        granted: 0,
        denied: 0
    });

    const lastLogId = useRef<string | null>(null);

    // Audio elements
    const successAudio = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'));
    const errorAudio = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'));

    useEffect(() => {
        loadLogs();
        let interval: any;
        if (isAutoRefresh) {
            interval = setInterval(loadLatestLogs, 3000);
        }
        return () => clearInterval(interval);
    }, [isAutoRefresh]);

    useEffect(() => {
        // Update stats
        const granted = logs.filter(l => l.result === 'granted').length;
        const denied = logs.filter(l => l.result === 'denied').length;
        setStats({
            total: logs.length,
            granted,
            denied
        });
    }, [logs]);

    const loadLogs = async () => {
        try {
            const response = await apiService.getAccessLogs({ limit: 30 });
            const data = response.data || [];
            setLogs(data);
            if (data.length > 0) {
                lastLogId.current = data[0].id;
            }
        } catch (error) {
            console.error("Erreur logs", error);
        } finally {
            setLoading(false);
        }
    };

    const loadLatestLogs = async () => {
        if (!lastLogId.current) return;
        try {
            const response = await apiService.getLatestAccessLogs(lastLogId.current);
            if (response.data && response.data.length > 0) {
                const newLogs = response.data;
                lastLogId.current = newLogs[0].id;

                // Play sound for the very last one
                if (newLogs[0].result === 'granted') {
                    successAudio.current.play().catch(() => { });
                } else {
                    errorAudio.current.play().catch(() => { });
                }

                setLogs(prev => [...newLogs, ...prev].slice(0, 50));
            }
        } catch (error) {
            console.error("Erreur polling", error);
        }
    };

    const filteredLogs = logs.filter(log => {
        if (filter === 'all') return true;
        return log.result === filter;
    });

    const successRate = stats.total > 0 ? Math.round((stats.granted / stats.total) * 100) : 0;

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-ocean-500 rounded-2xl shadow-lg shadow-ocean-500/20">
                            <SignalIcon className="w-8 h-8 text-white" />
                        </div>
                        Live Monitoring
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium italic">Accès Portuaires & Terminaux RFID</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-slate-800 p-1 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 flex">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filter === 'all' ? 'bg-ocean-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                        >
                            ALL
                        </button>
                        <button
                            onClick={() => setFilter('granted')}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filter === 'granted' ? 'bg-green-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                        >
                            OK
                        </button>
                        <button
                            onClick={() => setFilter('denied')}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filter === 'denied' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                        >
                            ERROR
                        </button>
                    </div>
                    <button
                        onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                        className={`px-6 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2 border-2 ${isAutoRefresh
                            ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20'
                            : 'bg-white text-gray-400 border-gray-200 dark:bg-slate-800 dark:border-slate-700'
                            }`}
                    >
                        <BoltIcon className={`w-5 h-5 ${isAutoRefresh ? 'animate-pulse' : ''}`} />
                        {isAutoRefresh ? 'LIVE' : 'PAUSED'}
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl">
                            <ChartBarIcon className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Scans</p>
                            <p className="text-3xl font-black dark:text-white">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-2xl">
                            <CheckCircleIcon className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Succès</p>
                            <p className="text-3xl font-black dark:text-white">{stats.granted}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-2xl">
                            <XCircleIcon className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Refus</p>
                            <p className="text-3xl font-black dark:text-white">{stats.denied}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-2xl">
                            <SignalIcon className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Ratio</p>
                            <p className="text-3xl font-black dark:text-white">{successRate}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Focus: Last Action */}
            {logs.length > 0 && (
                <div className={`p-10 rounded-[40px] border-4 shadow-2xl transition-all duration-500 transform hover:scale-[1.01] ${logs[0].result === 'granted'
                    ? 'bg-white border-green-500 dark:bg-slate-800 dark:border-green-500'
                    : 'bg-white border-red-500 dark:bg-slate-800 dark:border-red-500'
                    }`}>
                    <div className="flex flex-col lg:flex-row items-center gap-10">
                        <div className={`w-40 h-40 rounded-full flex items-center justify-center animate-bounce-short ${logs[0].result === 'granted' ? 'bg-green-500 shadow-2xl shadow-green-500/40' : 'bg-red-500 shadow-2xl shadow-red-500/40'
                            }`}>
                            {logs[0].result === 'granted'
                                ? <CheckCircleIcon className="w-24 h-24 text-white" />
                                : <XCircleIcon className="w-24 h-24 text-white" />
                            }
                        </div>
                        <div className="flex-1 text-center lg:text-left">
                            <div className={`text-sm font-black mb-2 uppercase tracking-widest ${logs[0].result === 'granted' ? 'text-green-500' : 'text-red-500'}`}>
                                Dernière Action Détectée
                            </div>
                            <h2 className={`text-6xl font-black mb-4 tracking-tighter ${logs[0].result === 'granted' ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'
                                }`}>
                                {logs[0].result === 'granted' ? 'ACCÈS VALIDE' : 'ACCÈS REFUSÉ'}
                            </h2>
                            <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                                <div className="flex items-center gap-3 font-bold text-3xl dark:text-white bg-gray-50 dark:bg-slate-700/50 px-6 py-3 rounded-2xl">
                                    <UserIcon className="w-8 h-8 text-ocean-500" />
                                    {logs[0].subscription?.user.name || logs[0].ticket?.passenger_name || 'Inconnu'}
                                </div>
                                <div className="flex items-center gap-2 bg-ocean-50 text-ocean-700 dark:bg-ocean-500/10 dark:text-ocean-300 px-6 py-3 rounded-2xl font-black text-lg">
                                    {logs[0].subscription ? <IdentificationIcon className="w-6 h-6" /> : <TicketIcon className="w-6 h-6" />}
                                    {logs[0].subscription ? logs[0].subscription.plan.name : `REF: ${logs[0].ticket?.booking.booking_reference}`}
                                </div>
                            </div>
                            {logs[0].deny_reason && (
                                <div className="mt-6 flex items-center gap-3 text-red-600 dark:text-red-400 font-black bg-red-50 dark:bg-red-900/20 p-5 rounded-3xl border-2 border-red-100 dark:border-red-900/30">
                                    <XCircleIcon className="w-8 h-8 shrink-0" />
                                    <span className="text-xl">ERREUR : {logs[0].deny_reason}</span>
                                </div>
                            )}
                        </div>
                        <div className="text-center lg:text-right border-l-0 lg:border-l-2 border-gray-100 dark:border-slate-700 pl-0 lg:pl-10">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Horodatage</p>
                            <p className="text-5xl font-black dark:text-white tabular-nums mb-1">
                                {new Date(logs[0].scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </p>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 rounded-xl text-sm font-bold dark:text-white">
                                <BoltIcon className="w-4 h-4 text-orange-500" />
                                {logs[0].device?.name || 'Portique #1'}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Log History */}
            <div className="bg-white dark:bg-slate-800 rounded-[35px] shadow-xl border border-gray-100 dark:border-slate-700/50 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-50 dark:border-slate-700/50 flex justify-between items-center bg-gray-50/50 dark:bg-black/10">
                    <div className="flex items-center gap-3">
                        <ChartBarIcon className="w-6 h-6 text-gray-400" />
                        <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider">Flux d'accès récent</h3>
                    </div>
                    <div className="text-xs font-black text-gray-400 bg-white dark:bg-slate-700 px-4 py-2 rounded-full shadow-sm">
                        FILTRE: {filter.toUpperCase()}
                    </div>
                </div>
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                    <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
                        {filteredLogs.map((log) => (
                            <div key={log.id} className="p-6 hover:bg-gray-50/80 dark:hover:bg-slate-700/40 transition-all flex items-center justify-between group">
                                <div className="flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${log.result === 'granted'
                                        ? 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                                        : 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                                        }`}>
                                        {log.result === 'granted' ? <CheckCircleIcon className="w-8 h-8" /> : <XCircleIcon className="w-8 h-8" />}
                                    </div>
                                    <div>
                                        <div className="font-black text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                            {log.subscription?.user.name || log.ticket?.passenger_name || 'Passager Inconnu'}
                                            {log.result === 'denied' && (
                                                <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full">ALERT</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 underline-offset-4">
                                            <span className="flex items-center gap-1 text-[11px] font-black text-ocean-500 uppercase tracking-tight">
                                                {log.subscription ? <IdentificationIcon className="w-3 h-3" /> : <TicketIcon className="w-3 h-3" />}
                                                {log.subscription ? 'BADGE RFID' : 'BILLET QR'}
                                            </span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-slate-600" />
                                            <span className="text-[11px] text-gray-400 font-bold uppercase">{log.device?.location || 'Quai Principal'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <div className="text-xl font-black text-gray-700 dark:text-white tabular-nums flex items-center gap-2">
                                            {new Date(log.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">
                                            {new Date(log.scanned_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                        </div>
                                    </div>
                                    <div className={`w-24 text-center py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border-2 transition-colors ${log.result === 'granted'
                                        ? 'bg-green-50 border-green-100 text-green-700 dark:bg-green-500/5 dark:border-green-500/20 dark:text-green-400'
                                        : 'bg-red-50 border-red-100 text-red-700 dark:bg-red-500/5 dark:border-red-500/20 dark:text-red-400'
                                        }`}>
                                        {log.result === 'granted' ? 'ADMIS' : 'REFUSÉ'}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredLogs.length === 0 && !loading && (
                            <div className="p-32 text-center">
                                <BoltIcon className="w-16 h-16 text-gray-200 dark:text-slate-700 mx-auto mb-4" />
                                <p className="text-gray-400 font-black uppercase tracking-widest">En attente de nouveaux scans...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes bounce-short {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-short {
                    animation: bounce-short 1s ease-in-out infinite;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #334155;
                }
            `}</style>
        </div>
    );
}
