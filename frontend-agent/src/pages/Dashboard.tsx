import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { agentService } from '../services/agentApi';
import Header from '../components/Header';
import {
    QrCodeIcon,
    LifebuoyIcon,
    ClockIcon,
    UserGroupIcon,
    ChevronRightIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
    const [trips, setTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadTrips();
    }, []);

    const loadTrips = async () => {
        try {
            const data = await agentService.getActiveTrips();
            setTrips(data.trips || []);
        } catch (error) {
            console.error("Failed to load trips", error);
        } finally {
            setLoading(false);
        }
    };

    // Filtrage et limitation
    const filteredTrips = trips
        .filter(trip =>
            trip.route?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            trip.ship?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 3); // Limiter aux 3 prochaines comme demandé

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 transition-colors">
            <Header />

            <div className="p-6 space-y-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Prochains Départs</h1>
                    <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest">
                        {filteredTrips.length} traversée(s) disponible(s)
                    </p>
                </div>

                {/* Barre de Recherche */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 group-focus-within:text-ocean-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Rechercher une destination ou un navire..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 transition-all shadow-sm"
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-600"></div>
                    </div>
                ) : filteredTrips.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border-2 border-dashed border-gray-100 dark:border-gray-800">
                        <p className="text-gray-400 font-bold">Aucune traversée trouvée.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredTrips.map((trip) => (
                            <button
                                key={trip.id}
                                onClick={() => navigate(`/scan/${trip.id}`)}
                                className="w-full bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm text-left flex items-center justify-between group active:scale-[0.98] transition-all"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:bg-ocean-50 dark:group-hover:bg-ocean-900/30 group-hover:text-ocean-600 dark:group-hover:text-ocean-400 transition-colors">
                                        <LifebuoyIcon className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${trip.status === 'boarding'
                                                    ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400'
                                                    : 'bg-ocean-50 text-ocean-600 dark:bg-ocean-950/30 dark:text-ocean-400'
                                                }`}>
                                                {trip.status === 'boarding' ? 'EMBARQUEMENT' : 'PRÉVU'}
                                            </span>
                                            <span className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">
                                                {trip.ship?.name}
                                            </span>
                                        </div>
                                        <p className="text-lg font-black text-gray-900 dark:text-white leading-tight">
                                            {trip.route?.name || 'Traversée Maritime'}
                                        </p>
                                        <div className="flex items-center gap-4 mt-1">
                                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-bold uppercase tracking-widest">
                                                <ClockIcon className="w-3.5 h-3.5 text-ocean-400" />
                                                {new Date(trip.departure_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-bold uppercase tracking-widest">
                                                <UserGroupIcon className="w-3.5 h-3.5 text-ocean-400" />
                                                {trip.available_seats_pax} places
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-300 dark:text-gray-700 group-hover:bg-ocean-600 group-hover:text-white dark:group-hover:bg-ocean-500 transition-all">
                                    <ChevronRightIcon className="w-5 h-5" />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Nav Simulation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-4 px-8 flex justify-between items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
                <div className="flex flex-col items-center gap-1 text-ocean-600 dark:text-ocean-400">
                    <QrCodeIcon className="w-6 h-6" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Scan</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-600">
                    <UserGroupIcon className="w-6 h-6" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Rapport</span>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

