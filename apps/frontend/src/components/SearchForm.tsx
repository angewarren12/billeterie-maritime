import { useState, useEffect } from 'react';
import type { Route, Trip } from '../services/api';
import { apiService } from '../services/api';
import { format } from 'date-fns';

interface SearchFormProps {
    onSearch?: (outwardTrips: Trip[], returnTrips?: Trip[]) => void;
}

interface Port {
    id: number;
    name: string;
    code: string;
    city: string;
}

export default function SearchForm({ onSearch }: SearchFormProps) {
    const [ports, setPorts] = useState<Port[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [departurePortId, setDeparturePortId] = useState('');
    const [arrivalPortId, setArrivalPortId] = useState('');
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [returnDate, setReturnDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way');
    const [passengers, setPassengers] = useState(1);
    const [loadingPorts, setLoadingPorts] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');

    useEffect(() => {
        // Chargement initial depuis le cache
        const cachedPorts = localStorage.getItem('cached_ports');
        if (cachedPorts) {
            try {
                setPorts(JSON.parse(cachedPorts));
                setLoadingPorts(false);
            } catch (e) {
                console.error('Error parsing cached ports');
            }
        }

        const cachedRoutes = localStorage.getItem('cached_routes');
        if (cachedRoutes) {
            try {
                setRoutes(JSON.parse(cachedRoutes));
            } catch (e) {
                console.error('Error parsing cached routes');
            }
        }

        // Chargement frais de l'API
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoadingPorts(true);
        try {
            // Charger les ports et les routes en parallèle
            const [portsData, routesData] = await Promise.all([
                apiService.getPorts(),
                apiService.getRoutes()
            ]);

            if (portsData) {
                setPorts(portsData);
                localStorage.setItem('cached_ports', JSON.stringify(portsData));
            }

            if (routesData && routesData.routes) {
                setRoutes(routesData.routes);
                localStorage.setItem('cached_routes', JSON.stringify(routesData.routes));
            }
        } catch (err) {
            console.error('Error loading initial data:', err);
            setSearchError('Impossible de charger les données de voyage');
        } finally {
            setLoadingPorts(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        setSearchError('');

        try {
            // Finding outward route
            const outwardRoute = routes.find(
                r => String(r.departure_port.id) === String(departurePortId) && String(r.arrival_port.id) === String(arrivalPortId)
            );

            if (!outwardRoute) {
                setSearchError('Aucun trajet disponible pour cette combinaison de ports');
                setIsSearching(false);
                return;
            }

            // Search outward trips
            const outwardData = await apiService.searchTrips({
                route_id: String(outwardRoute.id),
                date: selectedDate,
                min_capacity: passengers,
            });

            let returnTrips: Trip[] | undefined = undefined;

            if (tripType === 'round-trip') {
                // Finding return route (inverse)
                const returnRoute = routes.find(
                    r => String(r.departure_port.id) === String(arrivalPortId) && String(r.arrival_port.id) === String(departurePortId)
                );

                if (returnRoute) {
                    const returnData = await apiService.searchTrips({
                        route_id: String(returnRoute.id),
                        date: returnDate,
                        min_capacity: passengers,
                    });
                    returnTrips = returnData.trips;
                } else {
                    console.warn('No return route found for inverse combination');
                }
            }

            if (onSearch) {
                // We'll pass them together, the logic in calling component can decide how to show them
                onSearch(outwardData.trips, returnTrips);
            }
        } catch (err) {
            setSearchError('Erreur lors de la recherche');
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    // Filtrer les ports d'arrivée basés sur le port de départ sélectionné
    const availableArrivalPorts = departurePortId
        ? ports.filter(port => {
            // Vérifier s'il existe une route du port de départ vers ce port
            const hasRoute = routes.some(
                route => String(route.departure_port.id) === String(departurePortId) && String(route.arrival_port.id) === String(port.id)
            );
            // Ne pas inclure le port de départ dans les destinations
            return hasRoute && String(port.id) !== String(departurePortId);
        })
        : [];


    return (
        <div className="card max-w-5xl mx-auto backdrop-blur-3xl bg-white/90">
            <form onSubmit={handleSearch} className="space-y-10">
                {/* Trip Type Toggle - Ultra Premium */}
                <div className="flex bg-gray-100/80 p-1.5 rounded-[1.5rem] w-full max-w-md mx-auto relative">
                    <div
                        className={`absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] bg-white rounded-[1.2rem] shadow-xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${tripType === 'round-trip' ? 'translate-x-full' : 'translate-x-0'
                            }`}
                    />
                    <button
                        type="button"
                        onClick={() => setTripType('one-way')}
                        className={`relative z-10 flex-1 py-3 text-sm font-black transition-colors duration-500 ${tripType === 'one-way' ? 'text-ocean-600' : 'text-gray-400'}`}
                    >
                        ALLER SIMPLE
                    </button>
                    <button
                        type="button"
                        onClick={() => setTripType('round-trip')}
                        className={`relative z-10 flex-1 py-3 text-sm font-black transition-colors duration-500 ${tripType === 'round-trip' ? 'text-ocean-600' : 'text-gray-400'}`}
                    >
                        ALLER-RETOUR
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
                    {/* Departure Port */}
                    <div className="lg:col-span-3">
                        <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 mb-3 uppercase tracking-[0.2em] ml-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-ocean-500"></span>
                            Port de départ
                        </label>
                        <div className="relative group">
                            <select
                                value={departurePortId}
                                onChange={(e) => {
                                    setDeparturePortId(e.target.value);
                                    setArrivalPortId('');
                                }}
                                className="input-field pl-12"
                                required
                            >
                                <option value="">{loadingPorts ? 'Chargement...' : "D'où partez-vous ?"}</option>
                                {ports.map((port) => (
                                    <option key={port.id} value={port.id}>
                                        {port.name}
                                    </option>
                                ))}
                            </select>
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ocean-500 transition-transform group-focus-within:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Arrival Port */}
                    <div className="lg:col-span-3">
                        <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 mb-3 uppercase tracking-[0.2em] ml-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                            Destination
                        </label>
                        <div className="relative group">
                            <select
                                value={arrivalPortId}
                                onChange={(e) => setArrivalPortId(e.target.value)}
                                className="input-field pl-12"
                                required
                                disabled={!departurePortId || loadingPorts}
                            >
                                <option value="">Où allez-vous ?</option>
                                {availableArrivalPorts.map((port) => (
                                    <option key={port.id} value={port.id}>
                                        {port.name}
                                    </option>
                                ))}
                            </select>
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500 transition-transform group-focus-within:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className={`${tripType === 'round-trip' ? 'lg:col-span-4' : 'lg:col-span-3'}`}>
                        <div className={`grid ${tripType === 'round-trip' ? 'grid-cols-2' : 'grid-cols-1'} gap-4 h-full`}>
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 mb-3 uppercase tracking-[0.2em] ml-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    Départ
                                </label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    min={format(new Date(), 'yyyy-MM-dd')}
                                    className="input-field"
                                    required
                                />
                            </div>
                            {tripType === 'round-trip' && (
                                <div className="animate-slide-up">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 mb-3 uppercase tracking-[0.2em] ml-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                        Retour
                                    </label>
                                    <input
                                        type="date"
                                        value={returnDate}
                                        onChange={(e) => setReturnDate(e.target.value)}
                                        min={selectedDate}
                                        className="input-field"
                                        required
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Passengers */}
                    <div className={`${tripType === 'round-trip' ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                        <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 mb-3 uppercase tracking-[0.2em] ml-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                            Voyageurs
                        </label>
                        <div className="relative group">
                            <input
                                type="number"
                                value={passengers}
                                onChange={(e) => setPassengers(parseInt(e.target.value) || 1)}
                                min={1}
                                max={20}
                                className="input-field pl-12"
                                required
                            />
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500 transition-transform group-focus-within:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-4">
                    <button
                        type="submit"
                        disabled={isSearching || loadingPorts}
                        className="btn-primary w-full md:w-auto md:px-16 text-lg py-5 group shadow-2xl shadow-ocean-500/20"
                    >
                        {isSearching ? (
                            <span className="flex items-center gap-3">
                                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                ANALYSE DES OFFRES...
                            </span>
                        ) : (
                            <span className="flex items-center gap-3">
                                <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                TROUVER UN VOYAGE
                            </span>
                        )}
                    </button>
                </div>

                {searchError && (
                    <div className="bg-red-50/50 backdrop-blur-md border-2 border-red-100 text-red-700 px-6 py-4 rounded-2xl text-center font-bold animate-horizontal-shake">
                        🚨 {searchError}
                    </div>
                )}
            </form>
        </div>
    );
}
