import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { Trip } from '../services/api';
import { format, parseISO } from 'date-fns';

export default function TripDetails() {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const returnTripId = searchParams.get('return_trip_id');
    const navigate = useNavigate();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [returnTrip, setReturnTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        if (id) {
            loadTripDetails();
        }
    }, [id]);

    // Utiliser les images de la base de données ou les placeholders par défaut
    const displayImages = (trip?.images && trip.images.length > 0)
        ? trip.images.map((img: string) => img.startsWith('http') ? img : `${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${img}`)
        : [
            'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1540202404-d0c7fe46a087?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&h=600&fit=crop',
        ];

    const loadTripDetails = async () => {
        // Try to load from cache first
        const cacheKey = `trip_${id}`;
        const returnCacheKey = returnTripId ? `trip_${returnTripId}` : null;

        const cached = localStorage.getItem(cacheKey);
        const returnCached = returnCacheKey ? localStorage.getItem(returnCacheKey) : null;

        if (cached) {
            try {
                setTrip(JSON.parse(cached));
                if (returnCached) {
                    setReturnTrip(JSON.parse(returnCached));
                }
                setLoading(false);
            } catch (e) {
                console.error('Error parsing cached trip:', e);
            }
        }

        // Fetch fresh data in background
        try {
            const [tripData, returnTripData] = await Promise.all([
                apiService.getTrip(id!),
                returnTripId ? apiService.getTrip(returnTripId) : Promise.resolve(null)
            ]);

            setTrip(tripData);
            localStorage.setItem(cacheKey, JSON.stringify(tripData));

            if (returnTripData) {
                setReturnTrip(returnTripData);
                if (returnCacheKey) {
                    localStorage.setItem(returnCacheKey, JSON.stringify(returnTripData));
                }
            }
        } catch (error) {
            console.error('Error loading trip details:', error);
            if (!cached) {
                setTrip(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBookNow = () => {
        let url = `/reserver?trip=${id}`;
        if (returnTripId) {
            url += `&return_trip_id=${returnTripId}`;
        }
        navigate(url);
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
                    {/* Colonne principale */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Galerie d'images compacte */}
                        <div className="group relative overflow-hidden rounded-3xl bg-gray-200 shadow-2xl transition-all duration-500 hover:shadow-ocean-200/50">
                            <div className="relative h-72">
                                <img
                                    src={displayImages[selectedImage] || displayImages[0]}
                                    alt={trip.ship.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                                {displayImages.length > 1 && (
                                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
                                        {displayImages.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedImage(index)}
                                                className={`w-2.5 h-2.5 rounded-full border-2 border-white/50 transition-all duration-300 ${index === selectedImage ? 'bg-white w-10 border-white' : 'bg-white/20 hover:scale-125'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Informations du voyage plus compactes */}
                        <div className="card border-none shadow-xl shadow-gray-200/50 hover:shadow-ocean-100/50 transition-all duration-300">
                            <h1 className="text-4xl font-black mb-8 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                {trip.route.departure_port.name} → {trip.route.arrival_port.name}
                            </h1>

                            <div className="grid grid-cols-3 gap-6 mb-8">
                                <div className="p-4 bg-ocean-50/50 rounded-2xl border-b-4 border-ocean-200 hover:scale-105 transition-transform">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 bg-ocean-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <p className="text-[10px] font-black text-ocean-600 uppercase tracking-widest">Départ</p>
                                    </div>
                                    <p className="text-2xl font-black text-gray-900">{format(parseISO(trip.departure_time), 'HH:mm')}</p>
                                </div>

                                <div className="p-4 bg-green-50/50 rounded-2xl border-b-4 border-green-200 hover:scale-105 transition-transform">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Places</p>
                                    </div>
                                    <p className="text-2xl font-black text-gray-900">{trip.available_seats_pax}</p>
                                </div>

                                <div className="p-4 bg-purple-50/50 rounded-2xl border-b-4 border-purple-200 hover:scale-105 transition-transform">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Durée</p>
                                    </div>
                                    <p className="text-2xl font-black text-gray-900">{Math.floor(trip.route.duration_minutes / 60)}h{trip.route.duration_minutes % 60}m</p>
                                </div>
                            </div>

                            {returnTrip && (
                                <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-white rounded-3xl border border-gray-100 border-l-4 border-l-primary-500 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center shadow-inner">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                                            </svg>
                                        </div>
                                        <h2 className="text-lg font-black text-gray-800 tracking-tight">Retour inclus : {returnTrip.route.departure_port.name} → {returnTrip.route.arrival_port.name}</h2>
                                    </div>
                                    <div className="flex gap-8">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Départ Retour</p>
                                            <p className="text-2xl font-black text-ocean-600">
                                                {format(parseISO(returnTrip.departure_time), 'HH:mm')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Navire</p>
                                            <p className="text-2xl font-black text-gray-800 truncate">
                                                {returnTrip.ship.name}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-8 border-t border-gray-100 pt-8">
                                <div>
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Équipements à bord</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="flex items-center gap-3 group">
                                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center transition-transform group-hover:rotate-12">
                                                <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <span className="text-sm font-bold text-gray-700">Climatisation</span>
                                        </div>
                                        <div className="flex items-center gap-3 group">
                                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center transition-transform group-hover:rotate-12">
                                                <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <span className="text-sm font-bold text-gray-700">WiFi gratuit</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Navire</h3>
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="text-lg font-black text-gray-900">{trip.ship.name}</p>
                                        <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">{trip.ship.capacity_pax} Passagers</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Colonne latérale - Réservation compacte */}
                    <div className="lg:col-span-1">
                        <div className="card sticky top-24 border-none shadow-2xl shadow-ocean-200/40 bg-white overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-ocean-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                            <h3 className="text-2xl font-black mb-8 relative z-10">Réserver</h3>

                            <div className="mb-8 relative z-10">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">À partir de</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black bg-gradient-to-br from-ocean-600 to-ocean-800 bg-clip-text text-transparent">
                                        {Number(trip.base_price).toLocaleString()}
                                    </span>
                                    <span className="text-xl font-black text-gray-400 uppercase tracking-wider">FCFA</span>
                                </div>
                                <p className="text-xs font-bold text-ocean-500/80 mt-2">par personne {returnTrip ? '(Aller seul)' : ''}</p>
                            </div>

                            <div className="space-y-2 mb-8 relative z-10">
                                {trip.pricing_settings?.categories?.map((cat, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-gray-50/50 hover:bg-ocean-50/50 transition-colors">
                                        <span className="text-sm font-bold text-gray-700">{cat.name}</span>
                                        <span className="text-sm font-black text-gray-900">{cat.price.toLocaleString()} <span className="text-[10px] text-gray-400">FCFA</span></span>
                                    </div>
                                )) || (
                                        <>
                                            <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50/50">
                                                <span className="text-sm font-bold text-gray-700">Adulte</span>
                                                <span className="text-sm font-black text-gray-900">1 500 <span className="text-[10px] text-gray-400">FCFA</span></span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50/50">
                                                <span className="text-sm font-bold text-gray-700">Enfant (5-14 ans)</span>
                                                <span className="text-sm font-black text-gray-900">500 <span className="text-[10px] text-gray-400">FCFA</span></span>
                                            </div>
                                        </>
                                    )}
                            </div>

                            <button
                                onClick={handleBookNow}
                                disabled={trip.availability !== 'available'}
                                className={`group relative w-full py-4 px-6 bg-gradient-to-r from-ocean-600 to-ocean-500 text-white rounded-2xl font-black text-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-ocean-200 active:scale-95 shadow-lg ${trip.availability !== 'available' ? 'opacity-50 cursor-not-allowed grayscale' : ''
                                    }`}
                            >
                                <span className="relative z-10">{trip.availability === 'available' ? 'Réserver maintenant' : 'Complet'}</span>
                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </button>

                            <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-inner">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Garanties
                                </h4>
                                <ul className="space-y-3 text-sm">
                                    <li className="flex items-center gap-3 text-gray-700 font-bold">
                                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center"><svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>
                                        Annulation 24h
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-700 font-bold">
                                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center"><svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>
                                        Confirmation immédiate
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
