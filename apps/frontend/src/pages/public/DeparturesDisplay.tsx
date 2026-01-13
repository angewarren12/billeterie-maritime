import React, { useState, useEffect } from 'react';
import api from '../../services/api';

interface Trip {
    id: string;
    departure_time: string;
    arrival_time: string;
    status: 'scheduled' | 'boarding' | 'departed' | 'cancelled' | 'delayed';
    available_seats_pax: number;
    ship: {
        name: string;
    };
    route: {
        departure_port: { name: string };
        arrival_port: { name: string };
    };
}

const DeparturesDisplay = () => {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        // Horloge
        const timer = setInterval(() => setTime(new Date()), 1000);

        // Chargement initial
        loadTrips();

        // Rafraichissement auto toutes les 30 sec
        const fetcher = setInterval(loadTrips, 30000);

        return () => {
            clearInterval(timer);
            clearInterval(fetcher);
        };
    }, []);

    const loadTrips = async () => {
        try {
            // On récupère les voyages du jour
            const response = await api.get('/trips?date=' + new Date().toISOString().split('T')[0]);
            // On filtre pour ne garder que ceux qui ne sont pas "départis" depuis longtemps
            // Simplification: on prend tout ce que l'API renvoie pour le jour J
            setTrips(response.data.data || []);
        } catch (error) {
            console.error("Erreur chargement départs", error);
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'boarding': return { text: 'EMBARQUEMENT', color: 'bg-green-600 text-white animate-pulse' };
            case 'delayed': return { text: 'RETARDÉ', color: 'bg-orange-600 text-white' };
            case 'cancelled': return { text: 'ANNULÉ', color: 'bg-red-600 text-white' };
            case 'departed': return { text: 'PARTI', color: 'bg-gray-600 text-white' };
            default: return { text: 'À L\'HEURE', color: 'bg-blue-600 text-white' };
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans p-8 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-end border-b-4 border-ocean-500 pb-6 mb-8">
                <div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter">Départs / Departures</h1>
                    <p className="text-xl text-gray-400 mt-2 font-light">Gare Maritime Principale</p>
                </div>
                <div className="text-right">
                    <div className="text-6xl font-mono font-bold text-ocean-400">
                        {time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-xl text-gray-400">
                        {time.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 text-xl font-bold text-gray-500 uppercase tracking-widest mb-4 px-4">
                <div className="col-span-2">Heure</div>
                <div className="col-span-4">Destination</div>
                <div className="col-span-3">Navire / Ship</div>
                <div className="col-span-3 text-right">Statut / Status</div>
            </div>

            {/* Content */}
            <div className="space-y-4">
                {trips.length === 0 ? (
                    <div className="text-center py-20 text-gray-600 text-2xl font-light italic">
                        Aucun départ prévu pour le moment.
                    </div>
                ) : (
                    trips
                        .filter(t => t.status !== 'departed') // On cache les partis (optionnel) ou on les garde un peu
                        .slice(0, 8) // Max 8 lignes pour l'écran
                        .map((trip) => {
                            const status = getStatusLabel(trip.status);
                            return (
                                <div key={trip.id} className="grid grid-cols-12 gap-4 items-center bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
                                    <div className="col-span-2 text-4xl font-mono font-bold text-yellow-500">
                                        {new Date(trip.departure_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="col-span-4 text-3xl font-black uppercase text-white truncate">
                                        {trip.route.arrival_port.name}
                                    </div>
                                    <div className="col-span-3 text-xl font-medium text-gray-400 truncate">
                                        {trip.ship.name}
                                    </div>
                                    <div className="col-span-3 flex justify-end">
                                        <span className={`px-6 py-2 rounded-lg text-xl font-black uppercase tracking-widest shadow-lg ${status.color}`}>
                                            {status.text}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                )}
            </div>

            {/* Footer Message */}
            <div className="fixed bottom-0 left-0 right-0 py-4 bg-ocean-900 text-center text-ocean-200 text-xl font-medium marquee-container">
                <p>Merci de vous présenter à l'embarquement 15 minutes avant le départ. • Please arrive at boarding gate 15 minutes before departure.</p>
            </div>
        </div>
    );
};

export default DeparturesDisplay;
