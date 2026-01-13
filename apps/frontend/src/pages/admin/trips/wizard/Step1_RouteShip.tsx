import { useState, useEffect, useMemo } from 'react';
import { apiService } from '../../../../services/api';
import type { Ship, Route } from '../../../../services/api';
import { CheckCircleIcon, MagnifyingGlassIcon, MapIcon } from '@heroicons/react/24/outline';
import type { WizardData } from './CreateTripWizard';

interface Step1Props {
    data: WizardData;
    updateData: (updates: Partial<WizardData>) => void;
}

export default function Step1_RouteShip({ data, updateData }: Step1Props) {
    const [ships, setShips] = useState<Ship[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);
    const [routeSearch, setRouteSearch] = useState('');
    const [shipSearch, setShipSearch] = useState('');

    useEffect(() => {
        let isMounted = true;
        const loadContext = async () => {
            try {
                const [shipsData, routesData] = await Promise.all([
                    apiService.getAdminShips(),
                    apiService.getAdminRoutes()
                ]);

                if (isMounted) {
                    setShips(shipsData.data || (Array.isArray(shipsData) ? shipsData : []));
                    setRoutes(routesData.data || (Array.isArray(routesData) ? routesData : []));
                }
            } catch (err: any) {
                console.error("Failed to load context", err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        loadContext();
        return () => { isMounted = false; };
    }, []);

    const filteredRoutes = useMemo(() => {
        return routes.filter(r =>
            r.name.toLowerCase().includes(routeSearch.toLowerCase()) ||
            r.departure_port?.name.toLowerCase().includes(routeSearch.toLowerCase()) ||
            r.arrival_port?.name.toLowerCase().includes(routeSearch.toLowerCase())
        );
    }, [routes, routeSearch]);

    const filteredShips = useMemo(() => {
        return ships.filter(s =>
            s.name.toLowerCase().includes(shipSearch.toLowerCase()) ||
            s.type.toLowerCase().includes(shipSearch.toLowerCase())
        );
    }, [ships, shipSearch]);

    if (loading) {
        return (
            <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-ocean-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-bold">Synchronisation des ressources...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-fadeIn">
            {/* Route Selection */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">1. Choisissez une ligne de navigation</h3>
                        <p className="text-sm text-gray-500 font-medium">Sélectionnez le trajet pour ce nouveau voyage</p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une ligne..."
                            value={routeSearch}
                            onChange={(e) => setRouteSearch(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 transition-all font-bold text-sm"
                        />
                    </div>
                </div>

                {filteredRoutes.length === 0 ? (
                    <div className="bg-gray-50 dark:bg-white/5 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-gray-200 dark:border-white/10">
                        <p className="text-gray-500 font-bold">Aucune ligne trouvée pour "{routeSearch}"</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredRoutes.map((route) => (
                            <div
                                key={route.id}
                                onClick={() => updateData({ route_id: String(route.id) })}
                                className={`
                                    relative p-6 cursor-pointer rounded-[1.5rem] border-2 transition-all duration-300
                                    ${data.route_id === String(route.id)
                                        ? 'border-ocean-500 bg-ocean-50/50 dark:bg-ocean-900/20 shadow-xl shadow-ocean-500/10'
                                        : 'border-white dark:border-gray-800 bg-white dark:bg-gray-800/50 hover:border-ocean-200 dark:hover:border-ocean-800 shadow-sm'}
                                `}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${data.route_id === String(route.id) ? 'bg-ocean-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-white/10 text-gray-400'
                                        }`}>
                                        <MapIcon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="block text-base font-black text-gray-900 dark:text-white leading-tight">{route.name}</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-ocean-600">Ligne active</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{route.duration_minutes} min trajet</span>
                                        </div>
                                    </div>
                                    {data.route_id === String(route.id) && (
                                        <CheckCircleIcon className="w-6 h-6 text-ocean-500" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Ship Selection */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">2. Choisissez un navire</h3>
                        <p className="text-sm text-gray-500 font-medium">Assignez un navire disponible pour cette traversée</p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un navire..."
                            value={shipSearch}
                            onChange={(e) => setShipSearch(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 transition-all font-bold text-sm"
                        />
                    </div>
                </div>

                {filteredShips.length === 0 ? (
                    <div className="bg-gray-50 dark:bg-white/5 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-gray-200 dark:border-white/10">
                        <p className="text-gray-500 font-bold">Aucun navire trouvé pour "{shipSearch}"</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredShips.map((ship) => (
                            <div
                                key={ship.id}
                                onClick={() => updateData({ ship_id: String(ship.id) })}
                                className={`
                                    relative flex flex-col cursor-pointer rounded-[2rem] border-2 transition-all duration-300 overflow-hidden group shadow-sm
                                    ${data.ship_id === String(ship.id)
                                        ? 'border-ocean-500 bg-ocean-50/50 dark:bg-ocean-900/20 ring-4 ring-ocean-500/10'
                                        : 'border-white dark:border-gray-800 bg-white dark:bg-gray-800/50 hover:border-ocean-200 shadow-sm'}
                                `}
                            >
                                <div className="h-44 bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
                                    {ship.images && ship.images[0] ? (
                                        <img
                                            src={ship.images[0].startsWith('http') ? ship.images[0] : `${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${ship.images[0]}`}
                                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            alt={ship.name}
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 opacity-20" />
                                    )}
                                    {data.ship_id === String(ship.id) && (
                                        <div className="absolute top-4 right-4 bg-ocean-500 rounded-full p-2 shadow-lg ring-4 ring-white dark:ring-gray-900">
                                            <CheckCircleIcon className="h-5 w-5 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-5">
                                    <h4 className="font-black text-lg text-gray-900 dark:text-white truncate">{ship.name}</h4>
                                    <div className="mt-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-ocean-500 animate-pulse"></div>
                                            <span className="text-xs font-black text-gray-500 uppercase tracking-tighter">{ship.capacity_pax} Passagers</span>
                                        </div>
                                        <span className="text-[10px] font-black px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg uppercase tracking-widest">{ship.type}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
