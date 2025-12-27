import { useState, useEffect } from 'react';
import type { Route, Trip } from '../services/api';
import { apiService } from '../services/api';
import { format } from 'date-fns';

interface SearchFormProps {
    onSearch?: (trips: Trip[]) => void;
}

interface Port {
    id: string;
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
    const [passengers, setPassengers] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadRoutesAndPorts();
    }, []);

    const loadRoutesAndPorts = async () => {
        try {
            const data = await apiService.getRoutes();
            setRoutes(data.routes);

            // Extraire tous les ports uniques des routes
            const uniquePorts = new Map<string, Port>();
            data.routes.forEach(route => {
                if (route.departure_port) {
                    uniquePorts.set(route.departure_port.id, route.departure_port);
                }
                if (route.arrival_port) {
                    uniquePorts.set(route.arrival_port.id, route.arrival_port);
                }
            });

            setPorts(Array.from(uniquePorts.values()));
        } catch (err) {
            console.error('Error loading routes:', err);
            setError('Impossible de charger les ports');
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Trouver la route correspondante
            const matchingRoute = routes.find(
                r => String(r.departure_port.id) === String(departurePortId) && String(r.arrival_port.id) === String(arrivalPortId)
            );

            if (!matchingRoute) {
                setError('Aucun trajet disponible pour cette combinaison de ports');
                setLoading(false);
                return;
            }

            const data = await apiService.searchTrips({
                route_id: matchingRoute.id,
                date: selectedDate,
                min_capacity: passengers,
            });

            if (onSearch) {
                onSearch(data.trips);
            }
        } catch (err) {
            setError('Erreur lors de la recherche');
            console.error(err);
        } finally {
            setLoading(false);
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
        <div className="card max-w-5xl mx-auto">
            <form onSubmit={handleSearch} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Port de départ */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <svg className="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Port de départ
                        </label>
                        <select
                            value={departurePortId}
                            onChange={(e) => {
                                setDeparturePortId(e.target.value);
                                setArrivalPortId(''); // Reset arrival port when departure changes
                            }}
                            className="input-field"
                            required
                        >
                            <option value="">Choisir un port</option>
                            {ports.map((port) => (
                                <option key={port.id} value={port.id}>
                                    {port.name} ({port.city})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Port d'arrivée */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <svg className="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            Port d'arrivée
                        </label>
                        <select
                            value={arrivalPortId}
                            onChange={(e) => setArrivalPortId(e.target.value)}
                            className="input-field"
                            required
                            disabled={!departurePortId}
                        >
                            <option value="">
                                {departurePortId ? 'Choisir une destination' : 'Sélectionnez d\'abord un port de départ'}
                            </option>
                            {availableArrivalPorts.map((port) => (
                                <option key={port.id} value={port.id}>
                                    {port.name} ({port.city})
                                </option>
                            ))}
                        </select>
                        {departurePortId && availableArrivalPorts.length === 0 && (
                            <p className="text-xs text-red-500 mt-1">Aucune destination disponible depuis ce port</p>
                        )}
                    </div>

                    {/* Date Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <svg className="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Date de départ
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

                    {/* Passengers */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <svg className="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Passagers
                        </label>
                        <input
                            type="number"
                            value={passengers}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setPassengers(isNaN(val) ? 1 : val);
                            }}
                            min={1}
                            max={10}
                            className="input-field"
                            required
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary text-lg px-12 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Recherche...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Rechercher des voyages
                            </span>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
                        {error}
                    </div>
                )}
            </form>
        </div>
    );
}
