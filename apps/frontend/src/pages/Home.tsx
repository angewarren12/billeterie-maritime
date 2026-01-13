import { useState } from 'react';
import HeroSlider from '../components/HeroSlider';
import SearchForm from '../components/SearchForm';

import type { Trip } from '../services/api';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

// Sub-component for Trip Card
function TripCard({ trip, index, isSelected }: { trip: Trip; index: number; isSelected?: boolean }) {
    return (
        <div
            className={`group relative bg-white rounded-3xl shadow-xl shadow-gray-200/60 hover:shadow-2xl hover:shadow-ocean-200/40 transition-all duration-500 overflow-hidden border-2 animate-fade-in ${isSelected ? 'border-ocean-500' : 'border-gray-100 hover:border-ocean-200'}`}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className={`absolute inset-0 bg-gradient-to-r from-ocean-500/0 to-primary-500/0 group-hover:from-ocean-500/5 group-hover:to-primary-500/5 transition-all duration-500 pointer-events-none ${isSelected ? 'from-ocean-500/10 to-primary-500/10' : ''}`} />

            <div className="relative p-8">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                    <div className="flex-1 w-full">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-ocean-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-ocean-200/50 group-hover:scale-110 transition-transform duration-500">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                </div>
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

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="p-4 bg-gradient-to-br from-ocean-50 to-ocean-100/50 rounded-2xl border border-ocean-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-4 h-4 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-[10px] font-black text-ocean-700 uppercase tracking-widest">Départ</p>
                                </div>
                                <p className="text-xs font-bold text-ocean-600 mb-1">
                                    {format(parseISO(trip.departure_time), 'dd MMM yyyy', { locale: fr })}
                                </p>
                                <p className="text-2xl font-black text-ocean-900">
                                    {format(parseISO(trip.departure_time), 'HH:mm')}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857" />
                                    </svg>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Places</p>
                                </div>
                                <p className="text-2xl font-black text-gray-900">{trip.capacity_remaining}</p>
                            </div>
                            <div className="flex items-center justify-center">
                                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${trip.availability === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {trip.availability === 'available' ? 'Disponible' : 'Complet'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center lg:items-end gap-3 lg:min-w-[180px] lg:border-l lg:pl-8 border-gray-100">
                        <div className="text-center lg:text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 font-mono">À partir de</p>
                            <p className="text-4xl font-black text-gray-900">
                                {Number(trip.base_price).toLocaleString()} <span className="text-sm font-bold text-gray-400">FCFA</span>
                            </p>
                        </div>
                        <div className={`flex items-center gap-2 text-ocean-600 font-bold transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Sélectionné
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Home() {
    const [searchResults, setSearchResults] = useState<Trip[]>([]);
    const [returnResults, setReturnResults] = useState<Trip[] | undefined>(undefined);
    const [showResults, setShowResults] = useState(false);
    const [selectionStep, setSelectionStep] = useState<'outward' | 'return'>('outward');

    // Selection state
    const [selectedOutward, setSelectedOutward] = useState<Trip | null>(null);
    const [selectedReturn, setSelectedReturn] = useState<Trip | null>(null);

    const navigate = useNavigate();

    const handleSearch = (outward: Trip[], inward?: Trip[]) => {
        setSearchResults(outward);
        setReturnResults(inward);
        setShowResults(true);
        setSelectionStep('outward');
        setSelectedOutward(null);
        setSelectedReturn(null);
        // Scroll to results
        setTimeout(() => {
            const el = document.getElementById('search-results');
            el?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleOutwardSelect = (trip: Trip) => {
        setSelectedOutward(trip);
        if (returnResults !== undefined) {
            // Auto-transition to Step 2 for round trips
            setSelectionStep('return');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBooking = () => {
        if (!selectedOutward) return;

        let url = `/voyage/${selectedOutward.id}`;
        if (selectedReturn) {
            url += `?return_trip_id=${selectedReturn.id}`;
        }
        navigate(url);
    };

    return (
        <div className="min-h-screen pb-20 bg-gray-50/30">
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
                <section id="search-results" className="container mx-auto px-4 py-16 scroll-mt-20">
                    {/* Header with Step Indicator */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${selectionStep === 'outward' ? 'bg-ocean-600 text-white shadow-lg shadow-ocean-200' : 'bg-green-100 text-green-700'}`}>
                                    {selectionStep === 'outward' ? 'Étape 1/2' : '✓ Aller sélectionné'}
                                </span>
                                {returnResults !== undefined && (
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${selectionStep === 'return' ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-gray-100 text-gray-400'}`}>
                                        Étape 2/2
                                    </span>
                                )}
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-2">
                                {selectionStep === 'outward' ? 'Choisissez votre aller' : 'Choisissez votre retour'}
                            </h2>
                            <p className="text-gray-500 font-medium font-mono">
                                {selectionStep === 'outward' ? searchResults.length : returnResults?.length || 0} voyage(s) trouvé(s) pour cette direction
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            {selectionStep === 'return' && (
                                <button
                                    onClick={() => setSelectionStep('outward')}
                                    className="px-6 py-4 text-gray-600 font-bold hover:bg-white rounded-2xl transition"
                                >
                                    ← Modifier l'aller
                                </button>
                            )}
                            <button
                                onClick={() => { setShowResults(false); setReturnResults(undefined); }}
                                className="px-8 py-4 bg-white text-ocean-600 border-2 border-ocean-100 rounded-2xl font-black hover:bg-ocean-50 transition shadow-sm"
                            >
                                Nouvelle recherche
                            </button>
                        </div>
                    </div>

                    {searchResults.length === 0 && (!returnResults || returnResults.length === 0) ? (
                        <div className="card text-center py-20 bg-white border-2 border-gray-100 rounded-[3rem] shadow-xl shadow-gray-200/50">
                            {/* Empty state UI remains same... */}
                            <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
                                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-3xl font-black text-gray-800 mb-4">Aucun voyage trouvé</h3>
                            <p className="text-gray-500 mb-10 text-lg font-mono">Essayez une autre date ou un autre trajet</p>
                            <button onClick={() => setShowResults(false)} className="btn-primary px-10 py-4 text-lg">Effectuer une nouvelle recherche</button>
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            {/* Step 1: Outward */}
                            {selectionStep === 'outward' && (
                                <div className="space-y-6">
                                    {searchResults.length === 0 ? (
                                        <div className="p-20 border-2 border-dashed border-gray-200 rounded-[3rem] text-center text-gray-400 font-bold font-mono text-xl">
                                            Aucun voyage disponible pour l'aller
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-6">
                                            {searchResults.map((trip, index) => (
                                                <div
                                                    key={trip.id}
                                                    onClick={() => handleOutwardSelect(trip)}
                                                    className={`cursor-pointer group transition-all duration-500`}
                                                >
                                                    <TripCard trip={trip} index={index} isSelected={selectedOutward?.id === trip.id} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 2: Return */}
                            {selectionStep === 'return' && returnResults !== undefined && (
                                <div className="space-y-6">
                                    {returnResults.length === 0 ? (
                                        <div className="p-20 border-2 border-dashed border-gray-200 rounded-[3rem] text-center text-gray-400 font-bold font-mono text-xl">
                                            Aucun voyage disponible pour le retour
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-6">
                                            {returnResults.map((trip, index) => (
                                                <div
                                                    key={trip.id}
                                                    onClick={() => setSelectedReturn(trip)}
                                                    className={`cursor-pointer group transition-all duration-500`}
                                                >
                                                    <TripCard trip={trip} index={index} isSelected={selectedReturn?.id === trip.id} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </section>
            )}

            {/* Selection Summary Bar */}
            {showResults && (selectedOutward || selectedReturn) && (
                <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 shadow-[0_-20px_50px_rgba(0,0,0,0.08)] z-50 animate-slide-up">
                    <div className="container mx-auto px-6 py-6 lg:py-8">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                            <div className="flex flex-wrap items-center gap-6 lg:gap-12">
                                {/* Summary Outward */}
                                {selectedOutward && (
                                    <div className="flex items-center gap-4 bg-ocean-50/50 p-3 pr-6 rounded-2xl border border-ocean-100/50">
                                        <div className="w-12 h-12 bg-ocean-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-ocean-200">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] font-black text-ocean-600 uppercase tracking-widest">Aller sélectionné</p>
                                                <button onClick={() => setSelectionStep('outward')} className="text-[10px] font-bold text-ocean-400 hover:text-ocean-600 underline">Changer</button>
                                            </div>
                                            <p className="text-base font-black text-gray-900 leading-tight">
                                                {format(parseISO(selectedOutward.departure_time), 'HH:mm')} • {selectedOutward.route.name}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Summary Return */}
                                {returnResults !== undefined && (
                                    <div className={`flex items-center gap-4 p-3 pr-6 rounded-2xl border transition-all duration-300 ${selectedReturn ? 'bg-primary-50/50 border-primary-100/50' : 'bg-gray-50 border-dashed border-gray-200 animate-pulse'}`}>
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-all ${selectedReturn ? 'bg-primary-500 shadow-primary-200' : 'bg-gray-200 shadow-none'}`}>
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${selectedReturn ? 'text-primary-600' : 'text-gray-400'}`}>
                                                {selectedReturn ? 'Retour sélectionné' : 'En attente du retour'}
                                            </p>
                                            <p className={`text-base font-black leading-tight ${selectedReturn ? 'text-gray-900' : 'text-gray-300 font-mono italic'}`}>
                                                {selectedReturn ? `${format(parseISO(selectedReturn.departure_time), 'HH:mm')} • ${selectedReturn.route.name}` : 'Choisir un horaire'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-8 w-full lg:w-auto border-t lg:border-t-0 pt-6 lg:pt-0">
                                <div className="text-right flex-1 lg:flex-none">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Prix Total</p>
                                    <p className="text-3xl lg:text-4xl font-black text-gray-900">
                                        {(Number(selectedOutward?.base_price || 0) + Number(selectedReturn?.base_price || 0)).toLocaleString()} <span className="text-sm font-bold text-gray-400">FCFA</span>
                                    </p>
                                </div>
                                <button
                                    onClick={handleBooking}
                                    disabled={!selectedOutward || (returnResults !== undefined && !selectedReturn)}
                                    className={`relative group px-12 py-5 rounded-[1.5rem] font-black text-lg transition-all duration-500 overflow-hidden ${(!selectedOutward || (returnResults !== undefined && !selectedReturn)) ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none' : 'bg-ocean-600 text-white hover:bg-ocean-700 shadow-[0_15px_40px_rgba(3,105,161,0.25)] hover:scale-[1.05] active:scale-95'}`}
                                >
                                    <span className="relative z-10 flex items-center gap-3">
                                        Continuer
                                        <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-shimmer" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
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
