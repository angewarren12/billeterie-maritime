import { useState } from 'react';
import HeroSlider from '../components/HeroSlider';
import SearchForm from '../components/SearchForm';
import StatCard from '../components/StatCard';
import type { Trip } from '../services/api';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';

export default function Home() {
    const [searchResults, setSearchResults] = useState<Trip[]>([]);
    const [showResults, setShowResults] = useState(false);

    const handleSearch = (trips: Trip[]) => {
        setSearchResults(trips);
        setShowResults(true);
    };

    return (
        <div className="min-h-screen">
            {/* Hero Slider */}
            <HeroSlider />

            {/* Search Form - Overlapping the slider */}
            <div className="container mx-auto px-4 -mt-20 relative z-20">
                <div className="animate-slide-up">
                    <SearchForm onSearch={handleSearch} />
                </div>
            </div>

            {/* Stats Section */}
            <section className="container mx-auto px-4 mt-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up">
                    <StatCard
                        icon={
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        }
                        value="10+"
                        label="Trajets quotidiens"
                        color="from-ocean-500 to-primary-600"
                    />
                    <StatCard
                        icon={
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        }
                        value="500K+"
                        label="Passagers/an"
                        color="from-primary-500 to-ocean-600"
                    />
                    <StatCard
                        icon={
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                        }
                        value="98%"
                        label="Satisfaction"
                        color="from-green-500 to-emerald-600"
                    />
                    <StatCard
                        icon={
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        value="24/7"
                        label="Support client"
                        color="from-purple-500 to-pink-600"
                    />
                </div>
            </section>

            {/* Search Results */}
            {showResults && (
                <section className="container mx-auto px-4 py-12">
                    <h2 className="text-3xl font-display font-bold mb-8">
                        {searchResults.length} voyage{searchResults.length > 1 ? 's' : ''} disponible{searchResults.length > 1 ? 's' : ''}
                    </h2>

                    {searchResults.length === 0 ? (
                        <div className="card text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Aucun voyage trouvé</h3>
                            <p className="text-gray-500">Essayez une autre date ou un autre trajet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {searchResults.map((trip) => (
                                <div key={trip.id} className="card hover:shadow-2xl transition-all">
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-ocean-500 to-primary-600 rounded-xl flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">
                                                        {trip.route.departure_port.name} → {trip.route.arrival_port.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">{trip.ship.name}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Départ</p>
                                                    <p className="font-semibold">
                                                        {format(parseISO(trip.departure_time), 'HH:mm')}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Arrivée</p>
                                                    <p className="font-semibold">
                                                        {trip.arrival_time ? format(parseISO(trip.arrival_time), 'HH:mm') : 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Places restantes</p>
                                                    <p className="font-semibold">{trip.capacity_remaining}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Statut</p>
                                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${trip.availability === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {trip.availability === 'available' ? 'Disponible' : 'Complet'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-3">
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">À partir de</p>
                                                <p className="text-3xl font-bold text-ocean-600">1 500 <span className="text-sm text-gray-500">FCFA</span></p>
                                            </div>
                                            <Link
                                                to={`/voyage/${trip.id}`}
                                                className={`btn-primary ${trip.availability !== 'available' ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                                            >
                                                Voir les détails
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* Features */}
            {!showResults && (
                <section className="container mx-auto px-4 py-16">
                    <h2 className="text-4xl font-display font-bold text-center mb-12">
                        Pourquoi choisir <span className="gradient-text">Maritime Express</span> ?
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="card text-center group hover:scale-105 transition-transform">
                            <div className="w-16 h-16 bg-gradient-to-br from-ocean-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:animate-float">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Ponctualité</h3>
                            <p className="text-gray-600">Départs et arrivées à l'heure garantis à 98%</p>
                        </div>

                        <div className="card text-center group hover:scale-105 transition-transform">
                            <div className="w-16 h-16 bg-gradient-to-br from-ocean-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:animate-float">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Sécurité</h3>
                            <p className="text-gray-600">Navires modernes avec certifications internationales</p>
                        </div>

                        <div className="card text-center group hover:scale-105 transition-transform">
                            <div className="w-16 h-16 bg-gradient-to-br from-ocean-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:animate-float">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Prix Compétitifs</h3>
                            <p className="text-gray-600">Meilleurs tarifs du marché avec options d'abonnement</p>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
