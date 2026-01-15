import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import {
    TicketIcon,
    UserIcon,
    StarIcon,
    BellIcon,
    ArrowPathIcon,
    QrCodeIcon,
    ClockIcon,
    CalendarIcon,
    ArrowsRightLeftIcon,
    CheckBadgeIcon,
    GlobeAltIcon,
    PlusIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import SubscriptionCheckoutModal from '../components/SubscriptionCheckoutModal';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [subscriptions, setSubscriptions] = useState<any[]>([]); // MULTI
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'bookings' | 'badges' | 'profile'>('bookings');
    const [loyaltyTab, setLoyaltyTab] = useState<'ANNUEL' | 'MENSUEL'>('ANNUEL');
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [viewBadge, setViewBadge] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        passenger_type: 'adult',
        nationality_group: 'nacional'
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                passenger_type: (user as any).passenger_type || 'adult',
                nationality_group: (user as any).nationality_group || 'nacional'
            });
        }
    }, [user]);

    const handleUpdateProfile = async () => {
        try {
            await apiService.updateProfile(formData);
            alert("Profil mis à jour avec succès !");
            window.location.reload();
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Erreur lors de la mise à jour du profil.");
        }
    };

    const loadMyData = async () => {
        try {
            const [bookingsData, plansData, subsData] = await Promise.all([
                apiService.getMyBookings(),
                apiService.getBadgePlans(),
                apiService.getActiveSubscription().catch(() => ({ subscriptions: [], has_active_subscription: false }))
            ]);
            setBookings(bookingsData.bookings || []);
            setPlans(plansData.plans || []);
            setSubscriptions(subsData.subscriptions || []);
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMyData();
    }, []);

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Modal de commande */}
            {selectedPlan && (
                <SubscriptionCheckoutModal
                    plan={selectedPlan}
                    onClose={() => setSelectedPlan(null)}
                    onSuccess={() => {
                        loadMyData();
                        setActiveTab('badges');
                    }}
                />
            )}

            {/* Header Profil Premium */}
            <div className="bg-gray-900 text-white pt-16 pb-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-ocean-600/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-ocean-500 to-ocean-700 rounded-3xl flex items-center justify-center shadow-2xl border-2 border-white/10 transform rotate-3">
                                <UserIcon className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight">{user?.name}</h1>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-ocean-400 text-[10px] font-black uppercase tracking-widest">{user?.role === 'admin' ? 'Administrateur' : 'Client Privilège'}</span>
                                    <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                                    <span className="text-gray-400 text-[10px] font-bold uppercase">{user?.email}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-md">
                            <div className="text-right px-4">
                                <p className="text-[10px] text-ocean-300 font-black uppercase tracking-widest">Points Loyalty</p>
                                <p className="text-2xl font-black text-white">1,250 <span className="text-xs text-ocean-400 uppercase">pts</span></p>
                            </div>
                            <div className="w-12 h-12 bg-ocean-600 rounded-2xl flex items-center justify-center shadow-lg shadow-ocean-600/20">
                                <StarIcon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tab - App Native Style */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40">
                <div className="container mx-auto px-4 overflow-x-auto hide-scrollbar">
                    <div className="flex gap-8 min-w-max">
                        {[
                            { id: 'bookings', label: 'Traversées', icon: TicketIcon },
                            { id: 'badges', label: 'Abonnements', icon: CheckBadgeIcon },
                            { id: 'profile', label: 'Profil', icon: UserIcon }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`group py-4 px-2 flex items-center gap-2.5 transition-all relative ${activeTab === tab.id ? 'text-ocean-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <tab.icon className={`w-5 h-5 transition-transform group-active:scale-90 ${activeTab === tab.id ? 'text-ocean-500' : 'text-gray-300'}`} />
                                <span className={`text-[11px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === tab.id ? 'opacity-100' : 'opacity-80'}`}>{tab.label}</span>
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-ocean-600 rounded-t-full shadow-lg shadow-ocean-200" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {activeTab === 'bookings' && (
                    <div className="space-y-10">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Mes Dernières Réservations</h2>
                                <p className="text-gray-400 font-bold text-sm">Retrouvez l'historique de vos réservations et vos billets digitaux.</p>
                            </div>
                            <Link to="/reservation" className="btn-primary px-8 py-4 flex items-center gap-2 shadow-lg shadow-ocean-100">
                                <PlusIcon className="w-5 h-5" />
                                <span>Nouveau Voyage</span>
                            </Link>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white rounded-[2rem] p-6 h-48 border border-gray-100 animate-pulse flex flex-col justify-center gap-4">
                                        <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                                        <div className="h-8 bg-gray-100 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        ) : bookings.length === 0 ? (
                            <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-gray-100 space-y-6">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                                    <TicketIcon className="w-10 h-10 text-gray-300" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">Aucun voyage pour le moment</h3>
                                    <p className="text-gray-400 font-medium">Réservez votre première traversée vers Gorée en quelques clics.</p>
                                </div>
                                <Link to="/reservation" className="btn-primary inline-flex px-10 py-4">Réserver Maintenant</Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {bookings.map((booking, idx) => (
                                    <Link
                                        to={`/ticket/${booking.id}`}
                                        key={idx}
                                        className="block bg-white rounded-[2rem] p-6 border border-gray-100 hover:shadow-2xl hover:border-ocean-200 transition-all group overflow-hidden relative"
                                    >
                                        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-ocean-50 group-hover:text-ocean-600 transition-colors">
                                                    <TicketIcon className="w-8 h-8" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-[10px] font-black text-ocean-600 bg-ocean-50/50 px-3 py-1 rounded-full uppercase tracking-widest">{booking.booking_reference}</span>
                                                        <span className="text-xs text-gray-400 font-bold">{new Date(booking.created_at).toLocaleDateString('fr-FR')}</span>
                                                    </div>
                                                    <p className="text-xl font-black text-gray-900">
                                                        {booking.trip ? (
                                                            (typeof booking.trip.departure_port === 'object') ?
                                                                `${booking.trip.departure_port.name} → ${booking.trip.arrival_port.name}` :
                                                                `${booking.trip.departure_port} → ${booking.trip.arrival_port}`
                                                        ) : "Traversée Maritime"}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500 font-bold uppercase tracking-widest">
                                                        <ClockIcon className="w-3.5 h-3.5 text-ocean-400" />
                                                        {booking.trip?.departure_time ? (
                                                            <>
                                                                <span className="text-ocean-700">{new Date(booking.trip.departure_time).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                                                                <span className="text-gray-200 mx-1">•</span>
                                                                <span>{new Date(booking.trip.departure_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </>
                                                        ) : "--:--"}
                                                        <span className="text-gray-200 ml-1">|</span>
                                                        <span className="text-gray-400">{booking.tickets_count} Passager(s)</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8 pl-8 border-l border-gray-100 h-16">
                                                <div className="text-right">
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Statut</p>
                                                    <p className={`text-xs font-black uppercase tracking-widest ${booking.status === 'confirmed' ? 'text-green-600' : 'text-orange-500'}`}>
                                                        {booking.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                                                    </p>
                                                </div>
                                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-ocean-600 group-hover:text-white transition-all">
                                                    <QrCodeIcon className="w-6 h-6" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'badges' && (
                    <div className="space-y-10">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Mes Badges d'Abonnement</h2>
                                <p className="text-gray-400 font-bold text-sm">Gérez vos abonnements maritimes et consultez vos soldes de voyages.</p>
                            </div>
                            <button
                                onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
                                className="btn-primary px-8 py-4 flex items-center gap-2 shadow-lg shadow-ocean-100"
                            >
                                <PlusIcon className="w-5 h-5" />
                                <span>Nouveau Badge</span>
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex overflow-x-auto pb-8 gap-6 hide-scrollbar">
                                {[1, 2].map(i => (
                                    <div key={i} className="min-w-[85%] md:min-w-[45%] h-64 bg-gray-200 rounded-[2.5rem] animate-pulse"></div>
                                ))}
                            </div>
                        ) : subscriptions.length === 0 ? (
                            <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-gray-100 space-y-6">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                                    <TicketIcon className="w-10 h-10 text-gray-300" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">Aucun badge actif</h3>
                                    <p className="text-gray-400 font-medium">Souscrivez à un abonnement pour voyager plus souvent à moindre coût.</p>
                                    <p className="text-sm text-ocean-600 font-bold mt-4">Découvrez nos offres ci-dessous ↓</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex overflow-x-auto pb-8 gap-6 snap-x snap-mandatory hide-scrollbar">
                                {subscriptions.map((sub, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setViewBadge(sub)}
                                        className="min-w-[320px] md:min-w-[380px] snap-center cursor-pointer bg-gradient-to-br from-ocean-600 to-ocean-800 rounded-[2.5rem] p-7 text-white shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform border-4 border-transparent hover:border-white/20"
                                    >
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
                                        <div className="relative z-10 space-y-6">
                                            <div className="flex justify-between items-start">
                                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10 backdrop-blur-md">
                                                    <CheckBadgeIcon className="w-5 h-5 text-ocean-300" />
                                                    <span className="text-xs font-black uppercase tracking-widest">Actif</span>
                                                </div>
                                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                                    <TicketIcon className="w-6 h-6" />
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-3xl font-black tracking-tighter mb-2">{sub.plan_name}</h3>
                                                <p className="text-ocean-100 font-medium text-sm">Expire le {new Date(sub.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            </div>

                                            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                                                <p className="text-[10px] text-ocean-300 font-bold uppercase mb-2">Solde Disponible</p>
                                                {sub.plan.credit_type === 'unlimited' ? (
                                                    <p className="text-4xl font-black tracking-tight">ILLIMITÉ <span className="text-lg text-ocean-200">∞</span></p>
                                                ) : sub.voyage_credits_initial > 0 ? (
                                                    <p className="text-4xl font-black tracking-tight">{sub.voyage_credits_remaining} <span className="text-lg text-ocean-200">Voyages</span></p>
                                                ) : (
                                                    <p className="text-4xl font-black tracking-tight">{Number(sub.legacy_credit_fcfa || 0).toLocaleString('fr-FR')} <span className="text-lg text-ocean-200">FCFA</span></p>
                                                )}
                                            </div>

                                            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                                <div className="flex flex-col">
                                                    <p className="text-xs text-ocean-200 font-medium">ID: {sub.id.substring(0, 8).toUpperCase()}</p>
                                                    {sub.rfid_card_id && (
                                                        <p className="text-[10px] font-mono bg-black/20 px-2 py-1 rounded text-ocean-200 mt-1">{sub.rfid_card_id}</p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedPlan(sub.plan);
                                                    }}
                                                    className="bg-white text-ocean-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-ocean-50 shadow-sm transition-colors"
                                                >
                                                    {sub.plan.credit_type === 'counted' ? 'Recharger' : 'Renouveler'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Catalogue des Abonnements */}
                        <div id="catalog" className="space-y-12 mt-16 animate-slide-up">
                            <div className="text-center max-w-2xl mx-auto space-y-4 px-4">
                                <h3 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">Le Catalogue <span className="text-ocean-600">Maritime</span></h3>
                                <p className="text-sm md:text-lg text-gray-400 font-bold uppercase tracking-[0.2em]">"Plus vous voyagez, moins vous payez."</p>

                                {/* Système d'Onglets Subscriptions - Mobile Native Style */}
                                <div className="inline-flex p-1.5 bg-gray-100 rounded-[2rem] mt-6 border border-gray-100 shadow-inner">
                                    <button
                                        onClick={() => setLoyaltyTab('ANNUEL')}
                                        className={`px-10 py-3.5 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${loyaltyTab === 'ANNUEL' ? 'bg-white text-ocean-600 shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        Annuels
                                    </button>
                                    <button
                                        onClick={() => setLoyaltyTab('MENSUEL')}
                                        className={`px-10 py-3.5 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${loyaltyTab === 'MENSUEL' ? 'bg-white text-orange-600 shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        Mensuels
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8 px-4">
                                {loading ? (
                                    [1, 2, 3].map(i => (
                                        <div key={i} className="h-[500px] bg-white rounded-[3rem] p-1 border-2 border-gray-50 animate-pulse">
                                            <div className="bg-gray-50 rounded-[2.9rem] h-full"></div>
                                        </div>
                                    ))
                                ) : plans.filter(p => p.period === loyaltyTab).map((item, i) => (
                                    <div key={i} className={`group relative bg-white rounded-[3rem] p-1.5 border-2 transition-all duration-700 hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] ${loyaltyTab === 'ANNUEL' ? 'border-ocean-50 hover:border-ocean-600/20 shadow-ocean-600/5' : 'border-orange-50 hover:border-orange-600/20 shadow-orange-600/5'}`}>
                                        <div className="bg-white rounded-[2.8rem] p-8 md:p-10 h-full flex flex-col relative overflow-hidden active:scale-95 transition-transform duration-300">
                                            <div className={`absolute top-0 right-0 w-48 h-48 rounded-full -mr-24 -mt-24 blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${loyaltyTab === 'ANNUEL' ? 'bg-ocean-600' : 'bg-orange-600'}`}></div>

                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-10">
                                                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-2xl transform rotate-3 group-hover:rotate-0 group-hover:scale-110 transition-all duration-700 ${loyaltyTab === 'ANNUEL' ? 'bg-gradient-to-br from-ocean-500 to-ocean-700 shadow-ocean-200' : 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-200'}`}>
                                                        {loyaltyTab === 'ANNUEL' ? <CalendarIcon className="w-8 h-8" /> : <ClockIcon className="w-8 h-8" />}
                                                    </div>
                                                    <div className={`text-[9px] font-black uppercase tracking-[0.2em] bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 ${loyaltyTab === 'ANNUEL' ? 'text-ocean-600' : 'text-orange-600'}`}>
                                                        {loyaltyTab === 'ANNUEL' ? 'Premium Pro' : 'Eco Flexible'}
                                                    </div>
                                                </div>

                                                <h4 className="text-3xl font-black text-gray-900 mb-2 leading-none tracking-tighter">{item.name}</h4>
                                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-10 pl-1 border-l-4 border-ocean-100">Badge RFID Physique Inclus</p>

                                                <ul className="space-y-5 mb-12">
                                                    {[
                                                        { text: 'Priorité embarquement', icon: '⚡' },
                                                        { text: 'Portique instantané', icon: '📲' },
                                                        { text: 'Passage famille inclus', icon: '👨‍👩‍👧‍👦' }
                                                    ].map((f, idx) => (
                                                        <li key={idx} className="flex items-center gap-4 group/li">
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-transform group-hover/li:rotate-12 ${loyaltyTab === 'ANNUEL' ? 'bg-ocean-50 text-ocean-600' : 'bg-orange-50 text-orange-600'}`}>
                                                                {f.icon}
                                                            </div>
                                                            <span className="text-sm font-bold text-gray-500 group-hover/li:text-gray-900 transition-colors">{f.text}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="pt-10 border-t-2 border-dashed border-gray-100 mt-auto">
                                                <div className="flex items-baseline gap-2 mb-8">
                                                    <span className="text-5xl font-black text-gray-900 tracking-tighter">{(Number(item.price)).toLocaleString()}</span>
                                                    <span className="text-sm font-black text-gray-400 uppercase tracking-widest">FCFA</span>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedPlan(item)}
                                                    className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all duration-500 shadow-2xl flex items-center justify-center gap-3 text-white group relative overflow-hidden ${loyaltyTab === 'ANNUEL' ? 'bg-ocean-600 hover:bg-ocean-700 shadow-ocean-100' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-100'}`}
                                                >
                                                    <span className="relative z-10 flex items-center gap-2">
                                                        JE COMMANDE
                                                        <ArrowsRightLeftIcon className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                                                    </span>
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {/* Colonne Gauche: Résumé */}
                            <div className="md:col-span-1 space-y-6">
                                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 text-center shadow-sm">
                                    <div className="w-32 h-32 bg-ocean-50 rounded-[2.5rem] flex items-center justify-center text-ocean-600 mx-auto mb-6 border-4 border-white shadow-xl">
                                        <UserIcon className="w-16 h-16" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900">{user?.name}</h3>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Sénégalais • Dakar</p>
                                    <div className="mt-8 pt-8 border-t border-gray-50 flex justify-between">
                                        <div className="text-center px-4">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Voyages</p>
                                            <p className="text-lg font-black text-ocean-600">{bookings.length}</p>
                                        </div>
                                        <div className="w-px bg-gray-50"></div>
                                        <div className="text-center px-4">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Membre</p>
                                            <p className="text-lg font-black text-ocean-600">2025</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-ocean-900 rounded-[2.5rem] p-8 text-white space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                            <BellIcon className="w-5 h-5 text-ocean-300" />
                                        </div>
                                        <span className="text-sm font-black uppercase tracking-widest">Aide & Support</span>
                                    </div>
                                    <p className="text-xs text-ocean-400 leading-relaxed font-medium">Un problème avec votre badge ? Contactez notre service client disponible 24/7 au 33 800 00 00.</p>
                                </div>
                            </div>

                            {/* Colonne Droite: Formulaires */}
                            <div className="md:col-span-2 space-y-8">
                                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-10">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Mon Compte</h3>
                                        <span className="text-xs font-black text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest">Compte Vérifié</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block pl-2">Nom Complet</label>
                                            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center gap-4">
                                                <UserIcon className="w-5 h-5 text-gray-300" />
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="bg-transparent font-black text-gray-900 text-sm w-full outline-none"
                                                    placeholder="Votre nom"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block pl-2">Email</label>
                                            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center gap-4 opacity-60">
                                                <GlobeAltIcon className="w-5 h-5 text-gray-300" />
                                                <p className="font-black text-gray-900 text-sm">{user?.email}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block pl-2">Téléphone</label>
                                            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center gap-4">
                                                <span className="text-gray-300 font-bold">+221</span>
                                                <input
                                                    type="text"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="bg-transparent font-black text-gray-900 text-sm w-full outline-none"
                                                    placeholder="77 000 00 00"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block pl-2">Type Passager (Défaut)</label>
                                            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center gap-4">
                                                <UserIcon className="w-5 h-5 text-gray-300" />
                                                <select
                                                    value={formData.passenger_type}
                                                    onChange={(e) => setFormData({ ...formData, passenger_type: e.target.value })}
                                                    className="bg-transparent font-black text-gray-900 text-sm w-full outline-none"
                                                >
                                                    <option value="adult">Adulte</option>
                                                    <option value="child">Enfant (-12 ans)</option>
                                                    <option value="baby">Bébé</option>
                                                    <option value="senior">Senior</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block pl-2">Nationalité (Défaut)</label>
                                            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center gap-4">
                                                <GlobeAltIcon className="w-5 h-5 text-gray-300" />
                                                <select
                                                    value={formData.nationality_group}
                                                    onChange={(e) => setFormData({ ...formData, nationality_group: e.target.value })}
                                                    className="bg-transparent font-black text-gray-900 text-sm w-full outline-none"
                                                >
                                                    <option value="nacional">Locaux / Résidents</option>
                                                    <option value="african">CEDEAO / Afrique</option>
                                                    <option value="hors_afrique">International / Hors Afrique</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-gray-50 space-y-4">
                                        <button
                                            onClick={handleUpdateProfile}
                                            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition shadow-xl"
                                        >
                                            Sauvegarder les modifications
                                        </button>
                                        <button onClick={logout} className="w-full py-4 border-2 border-red-50 text-red-500 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-50 transition">Se déconnecter</button>
                                    </div>
                                </div>

                                {/* Sécurité */}
                                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                            <ArrowPathIcon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Sécurité</h3>
                                    </div>
                                    <button className="text-xs font-black text-ocean-600 hover:text-ocean-700 underline underline-offset-4 decoration-ocean-200">Changer mon mot de passe</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Détails Badge */}
            {viewBadge && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl relative">
                        <button
                            onClick={() => setViewBadge(null)}
                            className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                        >
                            <XMarkIcon className="w-6 h-6 text-gray-600" />
                        </button>

                        <div className="bg-ocean-900 p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter relative z-10">{viewBadge.plan_name}</h3>
                            <p className="text-ocean-200 text-sm relative z-10">Expire le {new Date(viewBadge.end_date).toLocaleDateString()}</p>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-2xl">
                                    <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Solde Actuel</p>
                                    {viewBadge.plan.credit_type === 'unlimited' ? (
                                        <p className="text-xl font-black text-gray-900">Voyages Illimités</p>
                                    ) : viewBadge.voyage_credits_initial > 0 ? (
                                        <p className="text-xl font-black text-gray-900">{viewBadge.voyage_credits_remaining} Voyages</p>
                                    ) : (
                                        <p className="text-xl font-black text-gray-900">{Number(viewBadge.legacy_credit_fcfa || 0).toLocaleString('fr-FR')} FCFA</p>
                                    )}
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl">
                                    <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Badge RFID</p>
                                    <p className="text-sm font-mono font-bold text-gray-700 break-all">{viewBadge.rfid_card_id || 'Non assigné'}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="font-bold text-gray-900">Gestion du Badge</h4>
                                <button
                                    onClick={() => {
                                        const planToRenew = viewBadge.plan;
                                        setViewBadge(null);
                                        setSelectedPlan(planToRenew);
                                    }}
                                    className="w-full py-4 border-2 border-ocean-600 text-ocean-600 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-ocean-50 transition"
                                >
                                    Renouveler / Recharger
                                </button>
                                <button className="w-full py-4 border-2 border-red-100 text-red-500 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-50 transition">
                                    Déclarer Perdu / Volé
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
