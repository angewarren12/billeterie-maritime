import { useState } from 'react';
import HeroSlider from '../components/HeroSlider';
import SearchForm from '../components/SearchForm';

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



            {/* Search Results */}
            {showResults && (
                <section className="container mx-auto px-4 py-16">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-4xl font-black text-gray-900 mb-2">
                                Voyages disponibles
                            </h2>
                            <p className="text-gray-500 font-medium">
                                {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowResults(false)}
                            className="px-6 py-3 text-ocean-600 border-2 border-ocean-200 rounded-2xl font-bold hover:bg-ocean-50 transition"
                        >
                            ← Nouvelle recherche
                        </button>
                    </div>

                    {searchResults.length === 0 ? (
                        <div className="card text-center py-16 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">Aucun voyage trouvé</h3>
                            <p className="text-gray-500 mb-6">Essayez une autre date ou un autre trajet</p>
                            <button
                                onClick={() => setShowResults(false)}
                                className="btn-primary inline-flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Effectuer une nouvelle recherche
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {searchResults.map((trip, index) => (
                                <div
                                    key={trip.id}
                                    className="group relative bg-white rounded-3xl shadow-xl shadow-gray-200/60 hover:shadow-2xl hover:shadow-ocean-200/40 transition-all duration-500 overflow-hidden border border-gray-100 hover:border-ocean-200 animate-fade-in"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Gradient overlay on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-ocean-500/0 to-primary-500/0 group-hover:from-ocean-500/5 group-hover:to-primary-500/5 transition-all duration-500 pointer-events-none" />

                                    <div className="relative p-8">
                                        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                                            {/* Left Section - Trip Info */}
                                            <div className="flex-1 w-full">
                                                {/* Route Header */}
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="relative">
                                                        <div className="w-16 h-16 bg-gradient-to-br from-ocean-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-ocean-200/50 group-hover:scale-110 transition-transform duration-500">
                                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                            </svg>
                                                        </div>
                                                        {/* Pulse effect */}
                                                        <div className="absolute inset-0 bg-ocean-400 rounded-2xl animate-ping opacity-20"></div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-2xl font-black text-gray-900 mb-1 group-hover:text-ocean-600 transition-colors">
                                                            {trip.route.departure_port.name} → {trip.route.arrival_port.name}
                                                        </h3>
                                                        <p className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                            </svg>
                                                            {trip.ship.name}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Trip Details Grid */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {/* Departure Time */}
                                                    <div className="p-4 bg-gradient-to-br from-ocean-50 to-ocean-100/50 rounded-2xl border border-ocean-100">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <svg className="w-4 h-4 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <p className="text-xs font-bold text-ocean-700 uppercase tracking-wider">Départ</p>
                                                        </div>
                                                        <p className="text-2xl font-black text-ocean-900">
                                                            {format(parseISO(trip.departure_time), 'HH:mm')}
                                                        </p>
                                                    </div>

                                                    {/* Arrival Time */}
                                                    <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-2xl border border-primary-100">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                            </svg>
                                                            <p className="text-xs font-bold text-primary-700 uppercase tracking-wider">Arrivée</p>
                                                        </div>
                                                        <p className="text-2xl font-black text-primary-900">
                                                            {trip.arrival_time ? format(parseISO(trip.arrival_time), 'HH:mm') : 'N/A'}
                                                        </p>
                                                    </div>

                                                    {/* Capacity */}
                                                    <div className={`p-4 bg-gradient-to-br rounded-2xl border ${trip.capacity_remaining > 50 ? 'from-green-50 to-green-100/50 border-green-100' :
                                                            trip.capacity_remaining > 20 ? 'from-yellow-50 to-yellow-100/50 border-yellow-100' :
                                                                'from-red-50 to-red-100/50 border-red-100'
                                                        }`}>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <svg className={`w-4 h-4 ${trip.capacity_remaining > 50 ? 'text-green-600' :
                                                                    trip.capacity_remaining > 20 ? 'text-yellow-600' :
                                                                        'text-red-600'
                                                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                            </svg>
                                                            <p className={`text-xs font-bold uppercase tracking-wider ${trip.capacity_remaining > 50 ? 'text-green-700' :
                                                                    trip.capacity_remaining > 20 ? 'text-yellow-700' :
                                                                        'text-red-700'
                                                                }`}>Places</p>
                                                        </div>
                                                        <p className={`text-2xl font-black ${trip.capacity_remaining > 50 ? 'text-green-900' :
                                                                trip.capacity_remaining > 20 ? 'text-yellow-900' :
                                                                    'text-red-900'
                                                            }`}>
                                                            {trip.capacity_remaining}
                                                        </p>
                                                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                                            <div
                                                                className={`h-1.5 rounded-full transition-all duration-500 ${trip.capacity_remaining > 50 ? 'bg-green-500' :
                                                                        trip.capacity_remaining > 20 ? 'bg-yellow-500' :
                                                                            'bg-red-500'
                                                                    }`}
                                                                style={{ width: `${(trip.capacity_remaining / trip.ship.capacity) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>

                                                    {/* Status Badge */}
                                                    <div className="flex items-center justify-center">
                                                        <span className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black uppercase tracking-wider shadow-lg transition-all ${trip.availability === 'available'
                                                                ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-green-200'
                                                                : 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-red-200'
                                                            }`}>
                                                            <span className={`w-2 h-2 rounded-full ${trip.availability === 'available' ? 'bg-white animate-pulse' : 'bg-white/70'
                                                                }`}></span>
                                                            {trip.availability === 'available' ? 'Disponible' : 'Complet'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Section - Price & CTA */}
                                            <div className="flex flex-col items-center lg:items-end gap-4 lg:min-w-[200px] border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8">
                                                <div className="text-center lg:text-right">
                                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">À partir de</p>
                                                    <p className="text-5xl font-black bg-gradient-to-r from-ocean-600 to-primary-600 bg-clip-text text-transparent mb-1">
                                                        1 500
                                                    </p>
                                                    <p className="text-sm font-bold text-gray-400">FCFA / personne</p>
                                                </div>
                                                <Link
                                                    to={`/voyage/${trip.id}`}
                                                    className={`w-full lg:w-auto px-8 py-4 rounded-2xl font-black text-center transition-all duration-300 shadow-xl flex items-center justify-center gap-3 ${trip.availability !== 'available'
                                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed pointer-events-none'
                                                            : 'bg-gradient-to-r from-ocean-500 to-primary-600 text-white hover:from-ocean-600 hover:to-primary-700 shadow-ocean-300/50 hover:shadow-2xl hover:scale-105'
                                                        }`}
                                                >
                                                    {trip.availability === 'available' ? (
                                                        <>
                                                            Réserver
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                            </svg>
                                                        </>
                                                    ) : 'Complet'}
                                                </Link>
                                            </div>
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
                <>
                    {/* Destinations Populaires */}
                    <section className="container mx-auto px-4 py-20">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-black text-gray-900 mb-4">Destinations Populaires</h2>
                            <p className="text-gray-500 max-w-2xl mx-auto text-lg">Découvrez les lieux les plus prisés du Sénégal, accessibles en quelques minutes par la mer.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { name: 'Île de Gorée', img: '/images/goree.png', price: '1 500', desc: 'Histoire et sérénité à 20 min de Dakar.' },
                                { name: 'Dakar Coast', img: '/images/dakar.png', price: '2 500', desc: 'Vues imprenables sur la capitale.' },
                                { name: 'Saint-Louis', img: '/images/saint-louis.png', price: '5 000', desc: 'Le charme de la cité historique.' },
                            ].map((dest, i) => (
                                <div key={i} className="group relative overflow-hidden rounded-3xl shadow-2xl h-[400px] cursor-pointer">
                                    <img src={dest.img} alt={dest.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80" />
                                    <div className="absolute bottom-0 p-8 w-full">
                                        <p className="text-white/70 text-sm font-bold uppercase tracking-widest mb-2">À partir de {dest.price} FCFA</p>
                                        <h3 className="text-3xl font-black text-white mb-2">{dest.name}</h3>
                                        <p className="text-white/80 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">{dest.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Comment ça marche */}
                    <section className="bg-ocean-900 py-24 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-ocean-500/10 rounded-full -mr-48 -mt-48 blur-3xl" />
                        <div className="container mx-auto px-4 relative z-10">
                            <div className="text-center mb-16">
                                <h2 className="text-4xl font-black mb-4">Réservez en 3 étapes simples</h2>
                                <p className="text-ocean-200">La manière la plus rapide de traverser l'Atlantique.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                {[
                                    { step: '01', title: 'Recherchez', desc: 'Choisissez vos ports et votre date de voyage.' },
                                    { step: '02', title: 'Réservez', desc: 'Indiquez les passagers et payez via Mobile Money.' },
                                    { step: '03', title: 'Embarquez', desc: 'Recevez votre QR Code et présentez-le à l\'agent.' },
                                ].map((item, i) => (
                                    <div key={i} className="relative p-8 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition">
                                        <span className="text-6xl font-black text-white/10 absolute top-4 right-8">{item.step}</span>
                                        <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                                        <p className="text-ocean-100 leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Features Section */}
                    <section className="container mx-auto px-4 py-24">
                        <h2 className="text-4xl font-display font-bold text-center mb-16">
                            L'excellence du <span className="gradient-text">Transport Maritime</span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="card text-center group hover:shadow-2xl transition-all p-10">
                                <div className="w-20 h-20 bg-gradient-to-br from-ocean-500 to-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-ocean-200 group-hover:rotate-6 transition-transform">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-black mb-4">Ponctualité</h3>
                                <p className="text-gray-600">Fini les attentes interminables. Nos navires respectent des horaires stricts pour votre confort.</p>
                            </div>

                            <div className="card text-center group hover:shadow-2xl transition-all p-10">
                                <div className="w-20 h-20 bg-gradient-to-br from-ocean-500 to-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-ocean-200 group-hover:rotate-6 transition-transform">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-black mb-4">Sécurité</h3>
                                <p className="text-gray-600">Nous appliquons les normes de sécurité maritime les plus strictes pour des traversées sereines.</p>
                            </div>

                            <div className="card text-center group hover:shadow-2xl transition-all p-10">
                                <div className="w-20 h-20 bg-gradient-to-br from-ocean-500 to-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-ocean-200 group-hover:rotate-6 transition-transform">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-black mb-4">Meilleurs Tarifs</h3>
                                <p className="text-gray-600">Des prix adaptés à tous les profils et des avantages exclusifs pour nos abonnés fidèles.</p>
                            </div>
                        </div>
                    </section>

                    {/* Mobile App Promo */}
                    <section className="container mx-auto px-4 py-20">
                        <div className="bg-gradient-to-br from-ocean-600 to-primary-700 rounded-[3rem] p-12 md:p-20 text-white flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32 blur-2xl" />
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-5xl font-black mb-6">Votre billet toujours en poche</h2>
                                <p className="text-xl text-ocean-100 mb-10 leading-relaxed">Téléchargez notre application pour réserver encore plus vite et accéder à vos billets hors-ligne, même sans internet au milieu de l'océan.</p>
                                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                    <button className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-ocean-50 transition">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 320 512"><path d="M272 0H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h224c26.5 0 48-21.5 48-48V48c0-26.5-21.5-48-48-48zM160 480c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z" /></svg>
                                        App Store
                                    </button>
                                    <button className="bg-ocean-800 text-white border border-white/20 px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-ocean-700 transition">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 512 512"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l220.7-127.3-60.1-60.1L104.6 499z" /></svg>
                                        Google Play
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 relative">
                                <div className="w-[300px] h-[600px] bg-gray-900 rounded-[3rem] border-8 border-gray-800 shadow-2xl overflow-hidden relative rotate-6 hover:rotate-0 transition-transform duration-500">
                                    <div className="absolute top-0 w-full h-8 bg-gray-800 flex justify-center items-end pb-1">
                                        <div className="w-16 h-4 bg-gray-900 rounded-full" />
                                    </div>
                                    <div className="p-6 pt-12">
                                        <div className="w-full h-40 bg-ocean-100 rounded-2xl mb-4 animate-pulse" />
                                        <div className="space-y-4">
                                            <div className="h-4 bg-ocean-100 rounded w-3/4 animate-pulse" />
                                            <div className="h-4 bg-ocean-100 rounded w-1/2 animate-pulse" />
                                            <div className="h-20 bg-ocean-50 rounded-2xl animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
