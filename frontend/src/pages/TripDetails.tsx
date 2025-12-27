import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { Trip } from '../services/api';
import { format, parseISO } from 'date-fns';

export default function TripDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);

    // Images du navire (placeholder - à remplacer par de vraies images)
    const shipImages = [
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1540202404-d0c7fe46a087?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&h=600&fit=crop',
    ];

    useEffect(() => {
        if (id) {
            loadTripDetails();
        }
    }, [id]);

    const loadTripDetails = async () => {
        try {
            const data = await apiService.getTrip(id!);
            setTrip(data.trip);
        } catch (error) {
            console.error('Error loading trip:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookNow = () => {
        navigate(`/reserver?trip=${id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ocean-500"></div>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Voyage introuvable</h2>
                    <button onClick={() => navigate('/')} className="btn-primary">
                        Retour à l'accueil
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
                    <button onClick={() => navigate('/')} className="hover:text-ocean-600">Accueil</button>
                    <span>›</span>
                    <span className="text-gray-900 font-medium">Détails du voyage</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Colonne principale */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Galerie d'images */}
                        <div className="card p-0 overflow-hidden">
                            <div className="relative h-96">
                                <img
                                    src={shipImages[selectedImage]}
                                    alt={trip.ship.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                                    {shipImages.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`w-3 h-3 rounded-full transition-all ${index === selectedImage ? 'bg-white w-8' : 'bg-white/50'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Informations du voyage */}
                        <div className="card">
                            <h1 className="text-3xl font-display font-bold mb-4">
                                {trip.route.departure_port.name} → {trip.route.arrival_port.name}
                            </h1>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-ocean-100 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Départ</p>
                                        <p className="font-semibold">{format(parseISO(trip.departure_time), 'HH:mm')}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Arrivée</p>
                                        <p className="font-semibold">
                                            {trip.arrival_time ? format(parseISO(trip.arrival_time), 'HH:mm') : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Places</p>
                                        <p className="font-semibold">{trip.capacity_remaining}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Durée</p>
                                        <p className="font-semibold">{Math.floor(trip.route.duration_minutes / 60)}h{trip.route.duration_minutes % 60}m</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="font-semibold text-lg mb-3">Navire</h3>
                                <p className="text-gray-700 mb-2"><strong>{trip.ship.name}</strong></p>
                                <p className="text-gray-600">Capacité totale: {trip.ship.capacity} passagers</p>
                            </div>

                            <div className="border-t pt-6 mt-6">
                                <h3 className="font-semibold text-lg mb-3">Équipements à bord</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700">Climatisation</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700">WiFi gratuit</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700">Restauration</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700">Sièges confortables</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Colonne latérale - Réservation */}
                    <div className="lg:col-span-1">
                        <div className="card sticky top-24">
                            <h3 className="text-2xl font-bold mb-4">Réserver ce voyage</h3>

                            <div className="mb-6">
                                <p className="text-sm text-gray-500 mb-2">À partir de</p>
                                <p className="text-4xl font-bold text-ocean-600">1 500 <span className="text-lg text-gray-500">FCFA</span></p>
                                <p className="text-sm text-gray-500 mt-1">par personne</p>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center py-3 border-b">
                                    <span className="text-gray-700">Adulte</span>
                                    <span className="font-semibold">1 500 FCFA</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b">
                                    <span className="text-gray-700">Enfant (5-14 ans)</span>
                                    <span className="font-semibold">500 FCFA</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b">
                                    <span className="text-gray-700">Bébé (&lt; 5 ans)</span>
                                    <span className="font-semibold">Gratuit</span>
                                </div>
                            </div>

                            <button
                                onClick={handleBookNow}
                                disabled={trip.availability !== 'available'}
                                className={`btn-primary w-full text-lg ${trip.availability !== 'available' ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {trip.availability === 'available' ? 'Réserver maintenant' : 'Complet'}
                            </button>

                            <div className="mt-6 p-4 bg-ocean-50 rounded-xl">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Bon à savoir
                                </h4>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    <li>✓ Annulation gratuite jusqu'à 24h avant</li>
                                    <li>✓ Confirmation instantanée</li>
                                    <li>✓ Billet électronique avec QR code</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
