import { useState } from 'react';
import HeroSlider from '../components/HeroSlider';
import SearchForm from '../components/SearchForm';

import type { Trip } from '../services/api';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

// Sub-component for Trip Card - Optimized for Mobile First
function TripCard({ trip, index, isSelected }: { trip: Trip; index: number; isSelected?: boolean }) {
    return (
        <div
            className={`group relative bg-white rounded-[2rem] shadow-xl transition-all duration-500 overflow-hidden border-2 animate-slide-up ${isSelected ? 'border-ocean-500 ring-4 ring-ocean-500/10' : 'border-gray-50 hover:border-ocean-200 shadow-gray-200/40'}`}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            {/* Premium Badge */}
            {trip.capacity_remaining > 50 && index === 0 && (
                <div className="absolute top-0 right-0 z-10">
                    <div className="bg-ocean-600 text-white text-[8px] font-black uppercase tracking-widest py-1.5 px-4 rounded-bl-2xl shadow-lg animate-pulse-slow">
                        LIAISON RAPIDE
                    </div>
                </div>
            )}

            <div className={`absolute inset-0 bg-gradient-to-br from-ocean-500/0 to-primary-500/0 transition-all duration-500 pointer-events-none ${isSelected ? 'from-ocean-500/5 to-primary-500/5' : 'group-hover:from-ocean-500/5 group-hover:to-primary-500/5'}`} />

            <div className="relative p-5 md:p-8">
                <div className="flex flex-col md:flex-row items-center gap-5 md:gap-8">
                    <div className="flex-1 w-full text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-4 mb-5 md:mb-6">
                            <div className="relative shrink-0">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-ocean-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-ocean-200/50 group-active:scale-90 transition-transform duration-300">
                                    <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </div>
                                {isSelected && <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-md animate-bounce-short"><svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg></div>}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg md:text-2xl font-black text-gray-900 group-hover:text-ocean-600 transition-colors tracking-tight">
                                    {trip.route?.departure_port?.name} <span className="text-gray-300 mx-1">→</span> {trip.route?.arrival_port?.name}
                                </h3>

                                <div className="flex items-center justify-center md:justify-start gap-4 mt-1.5">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <span className="text-ocean-500">🚢</span> {trip.ship?.name}
                                    </p>
                                    <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <span className="text-ocean-500">⏱️</span> {trip.route?.duration_minutes} MIN
                                    </p>

                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="p-3 bg-ocean-50/50 rounded-2xl border border-ocean-100/30 flex flex-col justify-center items-center md:items-start">
                                <p className="text-[10px] md:text-[8px] font-black text-ocean-600 uppercase tracking-[0.2em] mb-1">DÉPART</p>
                                <p className="text-xl md:text-2xl font-black text-ocean-950 leading-none">
                                    {format(parseISO(trip.departure_time), 'HH:mm')}
                                </p>
                                <p className="text-[9px] font-bold text-ocean-400 mt-1.5 uppercase">
                                    {format(parseISO(trip.departure_time), 'EEEE dd MMM', { locale: fr })}
                                </p>
                            </div>
                            <div className="p-3 bg-gray-50/50 rounded-2xl border border-gray-100/50 flex flex-col justify-center items-center md:items-start">
                                <p className="text-[10px] md:text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">PLACES</p>
                                <p className={`text-xl md:text-2xl font-black leading-none ${trip.capacity_remaining < 10 ? 'text-orange-600' : 'text-gray-900'}`}>{trip.capacity_remaining}</p>
                                <p className="text-[9px] font-bold text-gray-400 mt-1.5 uppercase">{trip.capacity_remaining < 10 ? 'PLUS QUE QUELQUES PLACES' : 'DISPONIBLES'}</p>
                            </div>
                            <div className="col-span-2 md:col-span-1 lg:col-span-2 flex items-center justify-center md:justify-end">
                                <div className="text-center md:text-right px-4">
                                    <p className="hidden md:block text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mb-2 font-mono italic">PRIX CONSEILLÉ</p>
                                    <p className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
                                        {Number(trip.base_price).toLocaleString()} <span className="text-xs md:text-sm font-black text-gray-400">FCFA</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center justify-center border-l-2 border-dashed border-gray-100 pl-8 min-w-[120px]">
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 scale-100 group-hover:scale-110 ${isSelected ? 'bg-ocean-500 border-ocean-500 text-white shadow-lg' : 'bg-white border-gray-200 text-transparent group-hover:border-ocean-300'}`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visual indicator card footer */}
            <div className={`h-1.5 w-full bg-gradient-to-r from-ocean-500 to-primary-500 transition-opacity duration-500 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
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
            if (el) {
                const yOffset = -20;
                const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }, 300);
    };

    const handleOutwardSelect = (trip: Trip) => {
        setSelectedOutward(trip);
        if (returnResults !== undefined) {
            // Auto-transition to Step 2 for round trips
            setTimeout(() => {
                setSelectionStep('return');
                window.scrollTo({ top: document.getElementById('search-results')?.offsetTop || 0, behavior: 'smooth' });
            }, 400);
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
        <div className="min-h-screen pb-safe bg-gray-50/50">
            {/* Hero Slider */}
            <HeroSlider />

            {/* Search Form - Overlapping with high-end glassmorphism */}
            <div className="container mx-auto px-4 -mt-24 md:-mt-32 relative z-20">
                <div className="animate-slide-up">
                    <SearchForm onSearch={handleSearch} />
                </div>
            </div>

            {/* Search Results */}
            {showResults && (
                <section id="search-results" className="container mx-auto px-4 py-20 scroll-mt-24">
                    {/* Header with Step Indicator - More Apple-like */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-black text-sm transition-all duration-500 ${selectionStep === 'outward' ? 'bg-ocean-600 text-white shadow-xl shadow-ocean-200' : 'bg-green-500 text-white'}`}>
                                    {selectionStep === 'outward' ? '1' : '✓'}
                                </div>
                                <div className={`h-1 w-8 rounded-full transition-all duration-500 ${selectionStep === 'return' ? 'bg-green-500' : 'bg-gray-200'}`} />
                                {returnResults !== undefined && (
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-black text-sm transition-all duration-500 ${selectionStep === 'return' ? 'bg-primary-600 text-white shadow-xl shadow-primary-200' : 'bg-gray-200 text-gray-500'}`}>
                                        2
                                    </div>
                                )}
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
                                {selectionStep === 'outward' ? 'Choisissez l\'aller' : 'Choisissez le retour'}
                            </h2>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                                {selectionStep === 'outward' ? searchResults.length : returnResults?.length || 0} OPTIONS DISPONIBLES
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                            {selectionStep === 'return' && (
                                <button
                                    onClick={() => setSelectionStep('outward')}
                                    className="px-6 py-4 bg-white text-gray-600 font-black rounded-2xl hover:bg-gray-50 transition border border-gray-100 text-sm active:scale-95"
                                >
                                    ← ÉTAPE PRÉCÉDENTE
                                </button>
                            )}
                            <button
                                onClick={() => { setShowResults(false); setReturnResults(undefined); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                className="px-6 py-4 bg-white text-ocean-600 rounded-2xl font-black hover:bg-ocean-50 transition border-2 border-ocean-100 text-sm active:scale-95"
                            >
                                RÉINITIALISER
                            </button>
                        </div>
                    </div>

                    {searchResults.length === 0 && (!returnResults || returnResults.length === 0) ? (
                        <div className="card text-center py-24 bg-white/80 backdrop-blur-3xl animate-slide-up">
                            <div className="w-24 h-24 bg-ocean-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <svg className="w-12 h-12 text-ocean-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 mb-4">Aucune traversée disponible</h3>
                            <p className="text-gray-500 mb-12 text-xl max-w-md mx-auto">Nous n'avons trouvé aucune offre pour ces critères. Essayez une autre date.</p>
                            <button onClick={() => { setShowResults(false); window.scrollTo({ top: 400, behavior: 'smooth' }); }} className="btn-primary px-12 py-5 text-lg">MODIFIER MA RECHERCHE</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8 animate-fade-in relative">
                            {/* Desktop step vertical indicator line */}
                            <div className="hidden lg:block absolute left-[-40px] top-0 bottom-0 w-1 bg-gradient-to-b from-ocean-500 to-transparent opacity-10 rounded-full" />

                            {/* Step 1: Outward */}
                            {selectionStep === 'outward' && (
                                <div className="space-y-6">
                                    {searchResults.length === 0 ? (
                                        <div className="p-20 border-4 border-dashed border-gray-100 rounded-[3rem] text-center text-gray-300 font-black uppercase tracking-widest text-xl">
                                            Pas d'aller disponible
                                        </div>
                                    ) : (
                                        searchResults.map((trip, index) => (
                                            <div
                                                key={trip.id}
                                                onClick={() => handleOutwardSelect(trip)}
                                                className="cursor-pointer"
                                            >
                                                <TripCard trip={trip} index={index} isSelected={selectedOutward?.id === trip.id} />
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Step 2: Return */}
                            {selectionStep === 'return' && returnResults !== undefined && (
                                <div className="space-y-6">
                                    {returnResults.length === 0 ? (
                                        <div className="p-20 border-4 border-dashed border-gray-100 rounded-[3rem] text-center text-gray-300 font-black uppercase tracking-widest text-xl">
                                            Pas de retour disponible
                                        </div>
                                    ) : (
                                        returnResults.map((trip, index) => (
                                            <div
                                                key={trip.id}
                                                onClick={() => setSelectedReturn(trip)}
                                                className="cursor-pointer"
                                            >
                                                <TripCard trip={trip} index={index} isSelected={selectedReturn?.id === trip.id} />
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </section>
            )}

            {/* Selection Summary Bar - Ultra Compact & Floating */}
            {showResults && (selectedOutward || selectedReturn) && (
                <div className="fixed bottom-24 lg:bottom-8 left-4 right-4 z-[60] animate-slide-up">
                    <div className="container mx-auto max-w-5xl">
                        <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.15)] border border-white/20 p-4 md:p-6">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
                                <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                                    <div className="flex -space-x-3">
                                        {selectedOutward && (
                                            <div className="w-12 h-12 bg-ocean-500 rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg z-20">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                        )}
                                        {returnResults !== undefined && (
                                            <div className={`w-12 h-12 rounded-full border-4 border-white flex items-center justify-center shadow-lg transition-all duration-500 z-10 ${selectedReturn ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-300 animate-pulse'}`}>
                                                {selectedReturn ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : <p className="text-xs font-black">2</p>}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 truncate">
                                            {returnResults === undefined ? 'TRAJET ALLER SÉLECTIONNÉ' : (selectedReturn ? 'VOTRE VOYAGE EST PRÊT' : 'CHOISISSEZ VOTRE RETOUR')}
                                        </p>
                                        <p className="text-sm md:text-lg font-black text-gray-900 leading-tight truncate">
                                            {Number(selectedOutward?.base_price || 0) + Number(selectedReturn?.base_price || 0)} FCFA TOTAL
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <button
                                        onClick={handleBooking}
                                        disabled={!selectedOutward || (returnResults !== undefined && !selectedReturn)}
                                        className="btn-primary flex-1 md:flex-none md:px-12 py-5 text-lg group relative overflow-hidden"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-3">
                                            RÉSERVER
                                            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                    </button>
                                </div>
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
