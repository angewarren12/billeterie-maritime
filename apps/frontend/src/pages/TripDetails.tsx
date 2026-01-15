import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { Trip } from '../services/api';
import { format, parseISO } from 'date-fns';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ClockIcon,
    UserGroupIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';


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
        <div className="min-h-screen bg-white">
            {/* Header Mobile Native Style */}
            <div className="fixed top-0 inset-x-0 h-16 bg-white/80 backdrop-blur-xl z-50 flex items-center px-4 justify-between border-b border-gray-100/50">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-900 active:scale-95 transition-transform"
                >
                    <ChevronLeftIcon className="w-6 h-6 stroke-[3]" />
                </button>
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Détails du Voyage</h2>
                <div className="w-10" /> {/* Spacer */}
            </div>

            <div className="pt-20 pb-32">
                {/* Galerie d'images - Immersive Mobile Style */}
                <div className="px-4 mb-8">
                    <div className="relative h-[45vh] w-full rounded-[3rem] overflow-hidden shadow-2xl group active:scale-[0.98] transition-all duration-500">
                        <img
                            src={displayImages[selectedImage] || displayImages[0]}
                            alt={trip.ship?.name || 'Navire'}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                        {/* Badges in Gallery */}
                        <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                            <div className="px-5 py-2.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
                                <p className="text-[10px] font-black text-white uppercase tracking-widest">Navigation Express</p>
                            </div>
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                                <svg className="w-6 h-6 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        </div>

                        {/* Title in Gallery */}
                        <div className="absolute bottom-10 left-8 right-8">
                            <h1 className="text-4xl font-black text-white tracking-tighter leading-none mb-3">
                                {trip.route?.departure_port?.name} <br />
                                <span className="text-ocean-400">→</span> {trip.route?.arrival_port?.name}
                            </h1>

                            <div className="flex gap-4 items-center">
                                <span className="px-3 py-1 bg-ocean-500/20 backdrop-blur-md text-ocean-300 text-[10px] font-black rounded-lg uppercase tracking-widest border border-ocean-500/30">
                                    🚢 {trip.ship?.name}
                                </span>
                                <span className="text-white/60 text-xs font-bold font-mono">#{String(trip.id).slice(0, 8).toUpperCase()}</span>
                            </div>
                        </div>

                        {/* Image Selectors */}
                        {displayImages.length > 1 && (
                            <div className="absolute bottom-6 left-8 flex gap-2">
                                {displayImages.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={(e) => { e.stopPropagation(); setSelectedImage(index); }}
                                        className={`h-1.5 rounded-full transition-all duration-500 ${index === selectedImage ? 'bg-white w-8 shadow-lg shadow-white/20' : 'bg-white/30 w-3 hover:bg-white/50'}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-4 space-y-10">
                    {/* Key Metrics - Vertical on Mobile, Grid on Tablet/Desktop */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 rounded-[2.5rem] p-6 border border-gray-100/50 hover:bg-ocean-50 hover:border-ocean-100 transition-all group">
                            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                <ClockIcon className="w-5 h-5 text-ocean-600" />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">DÉPART</p>
                            <p className="text-2xl font-black text-gray-900 leading-none">{format(parseISO(trip.departure_time), 'HH:mm')}</p>
                        </div>
                        <div className="bg-gray-50 rounded-[2.5rem] p-6 border border-gray-100/50 hover:bg-green-50 hover:border-green-100 transition-all group">
                            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                <UserGroupIcon className="w-5 h-5 text-green-600" />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">PLACES</p>
                            <p className="text-2xl font-black text-gray-900 leading-none">{trip.available_seats_pax}</p>
                        </div>
                        <div className="bg-gray-50 rounded-[2.5rem] p-6 border border-gray-100/50 hover:bg-purple-50 hover:border-purple-100 transition-all group">
                            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">DURÉE</p>
                            <p className="text-2xl font-black text-gray-900 leading-none">
                                {trip.route?.duration_minutes ? (
                                    `${Math.floor(trip.route.duration_minutes / 60)}h${trip.route.duration_minutes % 60}m`
                                ) : '--'}
                            </p>

                        </div>
                        <div className="bg-gray-50 rounded-[2.5rem] p-6 border border-gray-100/50 hover:bg-orange-50 hover:border-orange-100 transition-all group">
                            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                <CalendarIcon className="w-5 h-5 text-orange-600" />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">DATE</p>
                            <p className="text-lg font-black text-gray-900 leading-none">{format(parseISO(trip.departure_time), 'dd MMM')}</p>
                        </div>
                    </div>

                    {/* Return Info if applicable */}
                    {returnTrip && (
                        <div className="relative group bg-gradient-to-br from-ocean-900 to-ocean-800 rounded-[3rem] p-8 overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
                            <h4 className="text-[10px] font-black text-ocean-300 uppercase tracking-[0.3em] mb-4">RETOUR CONFIRMÉ</h4>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-3xl font-black text-white tracking-tighter mb-2">{returnTrip.route?.departure_port?.name} → {returnTrip.route?.arrival_port?.name}</p>
                                    <p className="text-ocean-200 text-sm font-bold flex items-center gap-2">
                                        <ClockIcon className="w-4 h-4" /> {format(parseISO(returnTrip.departure_time), 'HH:mm')} • {returnTrip.ship?.name}
                                    </p>

                                </div>
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/20">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cabin Details & Ship */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-4 border-l-4 border-ocean-600">Services & Équipements</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { icon: '❄️', name: 'Climatisation intégrale', desc: 'Indisponible sur les vieux rafiots' },
                                    { icon: '🛜', name: 'WiFi Premium', desc: 'Connexion satellite haut débit' },
                                    { icon: '🛋️', name: 'Sièges XL inclinables', desc: 'Confort optimal garanti' }
                                ].map((serv, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-3xl bg-gray-50 border border-transparent hover:border-gray-100 hover:bg-white transition-all shadow-sm">
                                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl">{serv.icon}</div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900">{serv.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{serv.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-4 border-l-4 border-primary-600">Le Navire</h3>
                            <div className="p-8 bg-gray-900 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:w-48 group-hover:h-48 transition-all duration-700"></div>
                                <div className="flex items-center gap-6 mb-6">
                                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-md">
                                        <svg className="w-8 h-8 text-primary-400" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM16 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM11 3a1 1 0 10-2 0v1a1 1 0 102 0V3z" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black tracking-tighter leading-none">{trip.ship?.name}</p>
                                        <p className="text-primary-400 text-xs font-black uppercase tracking-[0.2em] mt-2">Capacité {trip.ship?.capacity_pax} PAX</p>
                                    </div>

                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
                                    <p className="text-xs text-white/60 font-medium leading-relaxed italic">"Une flèche d'acier sur l'océan, alliant sécurité maximale et confort souverain."</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Booking Bar - Mobile Native Style */}
            <div className="fixed bottom-0 inset-x-0 p-6 bg-white/80 backdrop-blur-2xl border-t border-gray-100 shadow-[0_-20px_50px_rgba(0,0,0,0.05)] z-40">
                <div className="max-w-xl mx-auto flex items-center justify-between gap-6">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">PRIX DE BASE</p>
                        <p className="text-3xl font-black text-gray-900 leading-none tracking-tighter">
                            {Number(trip.base_price).toLocaleString()} <span className="text-xs font-bold text-gray-400">FCFA</span>
                        </p>
                    </div>
                    <button
                        onClick={handleBookNow}
                        disabled={trip.availability !== 'available'}
                        className={`flex-1 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all duration-500 shadow-2xl flex items-center justify-center gap-3 text-white group relative overflow-hidden active:scale-95 ${trip.availability === 'available' ? 'bg-ocean-600 hover:bg-ocean-700 shadow-ocean-200' : 'bg-gray-400 cursor-not-allowed shadow-none grayscale'}`}
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {trip.availability === 'available' ? 'RÉSERVER' : 'COMPLET'}
                            {trip.availability === 'available' && <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    </button>
                </div>
            </div>
        </div>
    );
}
