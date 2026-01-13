import { useState, useEffect } from 'react';
import type { Trip, User, CashDesk, SubscriptionPlan, PassengerInput } from '../../../services/api';
import { apiService } from '../../../services/api';
import {
    ShoppingCartIcon,
    UserGroupIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    TrashIcon,
    BanknotesIcon,
    CreditCardIcon,
    LockClosedIcon,
    CheckCircleIcon,
    ClockIcon,
    CloudArrowDownIcon,
    IdentificationIcon,
    ServerIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { thermalPrintService } from '../../../services/thermalPrinter';

interface BasketItem {
    id: string; // Unique ID for basket
    name: string;
    type: 'adult' | 'child' | 'baby';
    nationality_group: 'national' | 'resident' | 'african' | 'hors_afrique';
    price: number;
}

export default function POSDashboard() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [basket, setBasket] = useState<BasketItem[]>([]);
    const [customers, setCustomers] = useState<User[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
    const [customerSearch, setCustomerSearch] = useState('');
    const [tripSearch, setTripSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);

    // Formulaire Nouveau Passager
    const [newPassenger, setNewPassenger] = useState<PassengerInput>({
        name: '',
        type: 'adult',
        nationality_group: 'national'
    });

    const [offlineMode, setOfflineMode] = useState(!navigator.onLine);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [activeCashDesk, setActiveCashDesk] = useState<CashDesk | null>(null);
    const [activeSession, setActiveSession] = useState<any | null>(null);
    const [showOpenSessionModal, setShowOpenSessionModal] = useState(false);
    const [showCloseSessionModal, setShowCloseSessionModal] = useState(false);
    const [openingAmount, setOpeningAmount] = useState('0');
    const [closingAmount, setClosingAmount] = useState('0');
    const [closingNotes, setClosingNotes] = useState('');
    const [viewMode, setViewMode] = useState<'tickets' | 'subscriptions' | 'history'>('tickets');
    const [subTab, setSubTab] = useState<'plans' | 'manage'>('plans');
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [subSearch, setSubSearch] = useState('');
    const [subLoading, setSubLoading] = useState(false);
    const [rfidInputs, setRfidInputs] = useState<Record<string, string>>({});
    const [historyBookings, setHistoryBookings] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [showCreateCustomer, setShowCreateCustomer] = useState(false);
    const [newCustomerForm, setNewCustomerForm] = useState({ name: '', phone: '', email: '' });

    useEffect(() => {
        loadInitialData();

        const handleOnline = () => setOfflineMode(false);
        const handleOffline = () => setOfflineMode(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            // Parallélisation des appels pour gagner en vitesse
            const [user, sessionRes, plans] = await Promise.all([
                apiService.getCurrentUser(),
                apiService.getPosSessionStatus(),
                apiService.getSubscriptionPlans()
            ]);

            setCurrentUser(user);
            setSubscriptionPlans(plans.data || plans);

            // Détection immédiate du guichet depuis l'utilisateur si pas de session
            if (user.cash_desk) {
                setActiveCashDesk(user.cash_desk);
            }

            if (sessionRes.has_active_session) {
                setActiveSession(sessionRes.session);
                setActiveCashDesk(sessionRes.session.cash_desk);
                // Charger les voyages en arrière-plan
                loadTrips(sessionRes.session.cash_desk.port_id);
            } else {
                setActiveSession(null);
                if (user.cash_desk) {
                    setShowOpenSessionModal(true);
                } else {
                    toast.error("Aucun guichet ne vous est assigné.");
                }
            }
        } catch (error) {
            console.error("Erreur chargement initial", error);
            toast.error("Erreur lors de la récupération des données");
        } finally {
            setLoading(false);
        }
    };

    const loadSubscriptions = async (search: string = '') => {
        setSubLoading(true);
        try {
            const res = await apiService.getAdminSubscriptions({ search });
            setSubscriptions(res.data?.data || res.data || res);
        } catch (error) {
            console.error("Erreur chargement abonnements", error);
            toast.error("Erreur lors du chargement des abonnements");
        } finally {
            setSubLoading(false);
        }
    };

    const loadHistory = async () => {
        setHistoryLoading(true);
        try {
            const res = await apiService.getAdminBookings({ limit: 50 });
            setHistoryBookings(res.data?.data || res.data || []);
        } catch (error) {
            console.error("Erreur chargement historique", error);
            toast.error("Impossible de charger l'historique");
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        if (viewMode === 'history') {
            loadHistory();
        }
    }, [viewMode]);

    const handleAssociateRfid = async (subId: string) => {
        const rfid = rfidInputs[subId];
        if (!rfid) {
            toast.error("Veuillez saisir un numéro de carte RFID");
            return;
        }
        try {
            await apiService.associateRfid(subId, rfid);
            toast.success("Carte RFID associée avec succès");
            loadSubscriptions(subSearch);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeliverSub = async (subId: string) => {
        try {
            await apiService.deliverSubscription(subId);
            toast.success("Abonnement marqué comme livré");
            loadSubscriptions(subSearch);
        } catch (error) {
            console.error(error);
        }
    };

    const loadTrips = async (portId?: number) => {
        const pid = typeof portId === 'number' ? portId : activeCashDesk?.port_id;
        if (!pid) return;
        setLoading(true);
        try {
            const tripsRes = await apiService.getAdminTrips({
                departure_port_id: pid,
                status: 'scheduled,boarding'
            });

            const now = new Date();
            const filteredTrips = (tripsRes?.data || tripsRes || []).filter((t: any) => {
                const depTime = new Date(t.departure_time);
                return depTime >= now;
            });
            setTrips(filteredTrips);
            localStorage.setItem('pos_trips_cache', JSON.stringify(filteredTrips));
        } catch (error) {
            console.error("Erreur chargement voyages", error);
            const cached = localStorage.getItem('pos_trips_cache');
            if (cached) {
                setTrips(JSON.parse(cached));
                toast('Mode hors ligne : Voyages chargés depuis le cache', { icon: '📡' });
            } else {
                toast.error("Erreur lors du chargement des voyages");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCustomerSearch = (val: string) => {
        setCustomerSearch(val);
    };

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (customerSearch.length < 2) {
                setCustomers([]);
                return;
            }
            try {
                const results = await apiService.searchPosCustomers(customerSearch);
                setCustomers(results);
            } catch (error) {
                console.error(error);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [customerSearch]);

    const addToBasket = () => {
        if (!selectedTrip) {
            toast.error("Veuillez sélectionner un voyage");
            return;
        }
        if (!newPassenger.name) {
            toast.error("Nom du passager requis");
            return;
        }

        const price = parseFloat(selectedTrip.base_price) || 5000;
        const finalPrice = newPassenger.type === 'child' ? price * 0.5 : newPassenger.type === 'baby' ? 0 : price;

        const item: BasketItem = {
            id: Math.random().toString(36).substr(2, 9),
            ...newPassenger,
            price: finalPrice
        };

        setBasket([...basket, item]);
        setNewPassenger({ ...newPassenger, name: '' });
        toast.success("Ajouté au panier");
    };

    const removeFromBasket = (id: string) => {
        setBasket(basket.filter(item => item.id !== id));
    };

    const totalAmount = basket.reduce((sum, item) => sum + item.price, 0);

    const handleFinalizeSale = async (method: string) => {
        if (!selectedTrip && !basket.find(i => i.id.startsWith('sub_'))) {
            toast.error("Panier vide ou sélection manquante");
            return;
        }

        setLoading(true);
        try {
            let customerId = selectedCustomer?.id;

            // Si on doit créer un client
            if (showCreateCustomer && newCustomerForm.name) {
                try {
                    const res = await apiService.createPosCustomer(newCustomerForm);
                    customerId = res.data.id;
                    toast.success("Client créé avec succès");
                } catch (e: any) {
                    toast.error("Erreur lors de la création du client: " + (e.response?.data?.message || "Erreur"));
                    setLoading(false);
                    return;
                }
            }

            // Vérifier si c'est une vente d'abonnement
            const subItem = basket.find(item => item.id.startsWith('sub_'));

            if (subItem) {
                // Vente d'abonnement
                if (!customerId) {
                    toast.error("Veuillez sélectionner ou créer un client");
                    setLoading(false);
                    return;
                }

                const planId = parseInt(subItem.id.split('_')[1]);
                const subResponse = await apiService.salePosSubscription({
                    user_id: customerId as any,
                    plan_id: planId,
                    payment_method: method
                });

                // Impression reçu abonnement
                thermalPrintService.printReceipt({
                    companyName: "LIA MARITIME - POS",
                    companyAddress: "GARE MARITIME",
                    trip: {
                        departure: "ABONNEMENT",
                        arrival: subItem.name,
                        date: new Date().toLocaleDateString('fr-FR'),
                        shipName: "BADGE RFID"
                    },
                    bookingRef: `SUB-${subResponse.subscription.id}`,
                    passengers: [{
                        name: subResponse.subscription.user.name,
                        type: 'Abonné',
                        price: subItem.price
                    }],
                    totalAmount: subItem.price,
                    cashierName: currentUser?.name || "Agent",
                    date: new Date().toLocaleString('fr-FR')
                });

                toast.success('Abonnement activé et reçu imprimé');
            } else {
                // Vente de billets
                if (!selectedTrip) {
                    toast.error("Aucun voyage sélectionné");
                    setLoading(false);
                    return;
                }

                const data = {
                    trip_id: selectedTrip.id,
                    user_id: customerId,
                    cash_desk_id: activeCashDesk?.id,
                    passengers: basket.map(b => ({
                        name: b.name,
                        type: b.type,
                        nationality_group: b.nationality_group,
                        price: b.price
                    })),
                    payment_method: method,
                    total_amount: totalAmount
                };

                const response = await apiService.posSale(data);
                const bookingRef = response.booking.booking_reference;

                thermalPrintService.printReceipt({
                    companyName: "LIA MARITIME - POS",
                    companyAddress: "GARE MARITIME",
                    trip: {
                        departure: selectedTrip.route.departure_port.name,
                        arrival: selectedTrip.route.arrival_port.name,
                        date: new Date(selectedTrip.departure_time).toLocaleString('fr-FR'),
                        shipName: selectedTrip.ship.name
                    },
                    bookingRef: bookingRef,
                    passengers: basket.map(b => ({
                        name: b.name,
                        type: b.type,
                        price: b.price
                    })),
                    totalAmount: totalAmount,
                    cashierName: `${currentUser?.name || "Agent"} (${activeCashDesk?.name || "Sans guichet"})`,
                    date: new Date().toLocaleString('fr-FR')
                });

                toast.success("Vente réussie et ticket imprimé !");
            }

            setBasket([]);
            setSelectedCustomer(null);
            setCustomerSearch('');
            setShowCreateCustomer(false);
            setNewCustomerForm({ name: '', phone: '', email: '' });
            loadTrips();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Erreur lors de la vente");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenSession = async () => {
        if (!activeCashDesk) return;
        setLoading(true);
        try {
            const res = await apiService.startPosSession({
                opening_amount: parseFloat(openingAmount),
                cash_desk_id: activeCashDesk.id
            });
            setActiveSession(res.session);
            setShowOpenSessionModal(false);
            toast.success("Caisse ouverte ! Bonne vacation.");
            loadTrips(activeCashDesk.port_id);
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Erreur lors de l'ouverture");
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSession = async () => {
        if (!activeSession) return;
        setLoading(true);
        try {
            const responseData = await apiService.closePosSession({
                closing_amount_declared: parseFloat(closingAmount),
                notes: closingNotes
            });

            // Impression du Rapport Z avec les vraies données renvoyées par le backend
            const summary = responseData.summary;
            thermalPrintService.printZReport({
                companyName: "LIA MARITIME - POS",
                cashierName: currentUser?.name || "Agent Caisse",
                date: new Date().toLocaleDateString('fr-FR'),
                startTime: activeSession.opened_at ? new Date(activeSession.opened_at).toLocaleTimeString('fr-FR') : '--:--',
                endTime: new Date().toLocaleTimeString('fr-FR'),
                totalRevenue: summary.expected,
                totalTransactions: summary.bookings_count,
                paymentMethods: [
                    { method: 'Espèces', amount: summary.payments.cash, count: 0 },
                    { method: 'Digital/Carte', amount: summary.payments.card, count: 0 }
                ]
            });

            setActiveSession(null);
            setShowCloseSessionModal(false);
            toast.success("Caisse clôturée avec succès.");
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Erreur lors de la clôture");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex flex-col gap-6 p-6 bg-slate-50 dark:bg-slate-900 overflow-hidden text-slate-900 dark:text-slate-100">
            {/* Header */}
            <header className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/20">
                        <ShoppingCartIcon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">
                            POS <span className="text-indigo-600">Marine</span>
                        </h1>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Terminal de Vente Directe</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {offlineMode && (
                        <span className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 backdrop-blur-md text-amber-500 rounded-2xl text-[10px] font-black border border-amber-500/20 animate-pulse uppercase tracking-widest">
                            <CloudArrowDownIcon className="w-4 h-4" />
                            Mode Hors Ligne
                        </span>
                    )}

                    <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-2 pr-6 rounded-[1.5rem] shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-black">
                            {currentUser?.name?.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black uppercase tracking-tight">
                                {currentUser?.name}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                    {activeCashDesk?.name || 'Guichet non assigné'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => loadInitialData()}
                            disabled={loading}
                            className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-700 hover:scale-105 active:scale-95"
                        >
                            <CloudArrowDownIcon className={`w-5 h-5 text-slate-400 ${loading ? 'animate-bounce' : ''}`} />
                        </button>

                        {activeSession && (
                            <button
                                onClick={() => {
                                    setClosingAmount(activeSession.expected_amount.toString());
                                    setShowCloseSessionModal(true);
                                }}
                                className="flex items-center gap-2 px-5 py-3.5 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-600/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                <LockClosedIcon className="w-4 h-4" />
                                Clôturer Session
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Global Loading Overlay */}
            {loading && !activeCashDesk && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl">
                    <div className="relative">
                        <div className="w-24 h-24 border-4 border-indigo-600/20 rounded-full animate-ping"></div>
                        <div className="absolute inset-0 w-24 h-24 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="mt-8 flex flex-col items-center">
                        <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-2 italic">Initialisation du Terminal...</h3>
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col gap-6 min-h-0">
                {!activeCashDesk ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-[3rem] p-12 shadow-sm border-2 border-dashed border-rose-200 dark:border-rose-900/30">
                        <div className="w-24 h-24 bg-rose-50 dark:bg-rose-500/10 rounded-[2rem] flex items-center justify-center mb-6">
                            <LockClosedIcon className="w-12 h-12 text-rose-500" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-2">Service Verrouillé</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-center max-w-md font-medium text-sm">
                            Vous n'avez pas de guichet assigné. Veuillez contacter un administrateur pour l'assignation avant de commencer.
                        </p>
                        <button onClick={() => loadInitialData()} className="mt-8 px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all">
                            Vérifier l'assignation
                        </button>
                    </div>
                ) : !activeSession ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-[3rem] p-12 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-500/10 rounded-[2rem] flex items-center justify-center mb-6">
                            <BanknotesIcon className="w-12 h-12 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-2">Ouverture de Poste</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-center max-w-md font-medium text-sm mb-8">
                            Votre session de caisse est actuellement fermée. Vous devez l'ouvrir pour enregistrer des ventes.
                        </p>
                        <button
                            onClick={() => setShowOpenSessionModal(true)}
                            className="px-12 py-5 bg-indigo-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all"
                        >
                            Ouvrir la Caisse
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Navigation Tabs */}
                        <nav className="flex gap-3">
                            {[
                                { id: 'tickets', label: 'Tickets Voyage', icon: ShoppingCartIcon },
                                { id: 'subscriptions', label: 'Abonnements & RFID', icon: UserGroupIcon },
                                { id: 'history', label: 'Historique Journée', icon: ClockIcon },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setViewMode(tab.id as any)}
                                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === tab.id
                                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-105'
                                        : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>

                        {/* Main Interaction Area */}
                        <div className="flex-1 flex gap-6 min-h-0">
                            {/* Left Column: Products & Forms */}
                            <div className="flex-[2.5] flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                                {viewMode === 'tickets' && (
                                    <>
                                        {/* Trip Selection Area */}
                                        <section className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-sm border border-slate-200 dark:border-slate-700">
                                            <div className="flex justify-between items-center mb-8">
                                                <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
                                                    <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                                                    Trajets Disponibles
                                                </h2>
                                                <div className="relative w-72">
                                                    <input
                                                        type="text"
                                                        value={tripSearch}
                                                        onChange={(e) => setTripSearch(e.target.value)}
                                                        placeholder="Filtrer par destination..."
                                                        className="w-full bg-slate-50 dark:bg-slate-700/50 border-none rounded-2xl py-3.5 px-5 pl-11 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                    />
                                                    <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {trips.length === 0 ? (
                                                    <div className="py-16 text-center border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-[2.5rem]">
                                                        <ClockIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Aucun voyage programmé</p>
                                                    </div>
                                                ) : (
                                                    trips.map(trip => (
                                                        <div
                                                            key={trip.id}
                                                            onClick={() => setSelectedTrip(trip)}
                                                            className={`group relative cursor-pointer p-5 rounded-2xl border-2 transition-all duration-300 flex items-center gap-6 ${selectedTrip?.id === trip.id
                                                                ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                                                                : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-indigo-200 dark:hover:border-indigo-900/50 hover:shadow-md'
                                                                }`}
                                                        >
                                                            {/* Time */}
                                                            <div className="flex-shrink-0 w-20 text-center">
                                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Départ</div>
                                                                <div className="text-2xl font-black tabular-nums text-slate-900 dark:text-white">
                                                                    {new Date(trip.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                            </div>

                                                            {/* Route */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="font-black text-base text-slate-800 dark:text-white uppercase truncate">
                                                                        {trip.route.departure_port.name}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                                        <div className="h-[2px] w-6 bg-indigo-300"></div>
                                                                        <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                                                        </svg>
                                                                    </div>
                                                                    <div className="font-black text-base text-indigo-600 dark:text-indigo-400 uppercase truncate">
                                                                        {trip.route.arrival_port.name}
                                                                    </div>
                                                                </div>
                                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1 truncate">
                                                                    {trip.ship.name}
                                                                </div>
                                                            </div>

                                                            {/* Seats */}
                                                            <div className="flex-shrink-0 text-center w-24">
                                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${trip.available_seats_pax > 20 ? 'text-emerald-600 bg-emerald-500/10' : 'text-rose-600 bg-rose-500/10'}`}>
                                                                    <UserGroupIcon className="w-4 h-4" />
                                                                    {trip.available_seats_pax}
                                                                </div>
                                                            </div>

                                                            {/* Price */}
                                                            <div className="flex-shrink-0 text-right w-28">
                                                                <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                                                                    {parseInt(trip.base_price || '5000').toLocaleString()}
                                                                </div>
                                                                <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">FCFA</div>
                                                            </div>

                                                            {/* Selected indicator */}
                                                            {selectedTrip?.id === trip.id && (
                                                                <div className="absolute -top-2 -right-2 p-1.5 bg-indigo-600 rounded-full shadow-lg border-2 border-white dark:border-slate-800">
                                                                    <CheckCircleIcon className="w-4 h-4 text-white" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </section>

                                        {/* Passenger Input Form */}
                                        <section className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-sm border border-slate-200 dark:border-slate-700">
                                            <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 dark:text-white flex items-center gap-3 mb-8">
                                                <div className="w-1.5 h-6 bg-cyan-500 rounded-full"></div>
                                                Informations Voyageur
                                            </h2>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Identité Complète</label>
                                                    <input
                                                        type="text"
                                                        value={newPassenger.name}
                                                        onChange={e => setNewPassenger({ ...newPassenger, name: e.target.value })}
                                                        className="w-full bg-slate-50 dark:bg-slate-700/50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500/20"
                                                        placeholder="Nom et Prénom..."
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tranche d'Âge</label>
                                                    <select
                                                        value={newPassenger.type}
                                                        onChange={e => setNewPassenger({ ...newPassenger, type: e.target.value as any })}
                                                        className="w-full bg-slate-50 dark:bg-slate-700/50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500/20 appearance-none bg-no-repeat bg-[right_1rem_center]"
                                                    >
                                                        <option value="adult">Adulte (Ticket Full)</option>
                                                        <option value="child">Enfant (-12 ans)</option>
                                                        <option value="baby">Bébé (-2 ans)</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Groupe Tarifaire</label>
                                                    <select
                                                        value={newPassenger.nationality_group}
                                                        onChange={e => setNewPassenger({ ...newPassenger, nationality_group: e.target.value as any })}
                                                        className="w-full bg-slate-50 dark:bg-slate-700/50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500/20 appearance-none"
                                                    >
                                                        <option value="national">National / Casamance</option>
                                                        <option value="resident">Résident étranger</option>
                                                        <option value="african">CEDEAO</option>
                                                        <option value="hors_afrique">Étranger (HT)</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <button
                                                onClick={addToBasket}
                                                className="mt-8 w-full bg-slate-900 dark:bg-indigo-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-95 shadow-xl shadow-indigo-600/10"
                                            >
                                                <PlusIcon className="w-5 h-5" />
                                                Valider et Ajouter au Panier
                                            </button>
                                        </section>
                                    </>
                                )}

                                {viewMode === 'subscriptions' && (
                                    <div className="flex-1 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setSubTab('plans')}
                                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${subTab === 'plans' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'}`}
                                            >
                                                Nouveaux Abonnements
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSubTab('manage');
                                                    loadSubscriptions();
                                                }}
                                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${subTab === 'manage' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'}`}
                                            >
                                                Gestion & RFID
                                            </button>
                                        </div>

                                        {subTab === 'plans' ? (
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2 custom-scrollbar pb-12">
                                                {Array.isArray(subscriptionPlans) && subscriptionPlans.map(plan => (
                                                    <div
                                                        key={plan.id}
                                                        className="group bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-2xl hover:border-indigo-500/30 transition-all cursor-pointer relative overflow-hidden h-fit"
                                                        onClick={() => {
                                                            const newItem: BasketItem = {
                                                                id: `sub_${plan.id}_${Date.now()}`,
                                                                name: `Badge: ${plan.name}`,
                                                                type: 'adult',
                                                                nationality_group: 'national',
                                                                price: Number(plan.price)
                                                            };
                                                            setBasket([newItem]); // One subscription at a time
                                                            toast.success(`${plan.name} ajouté`);
                                                        }}
                                                    >
                                                        <div className="absolute top-0 right-0 p-6">
                                                            <IdentificationIcon className="w-8 h-8 text-slate-100 dark:text-slate-700/30 group-hover:text-indigo-500/20 transition-colors" />
                                                        </div>
                                                        <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-1">{plan.name}</h3>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Valable {plan.duration_days} jours</p>
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{Number(plan.price).toLocaleString()}</span>
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-medium">CFA</span>
                                                        </div>
                                                    </div>
                                                ))}
                                                {subscriptionPlans.length === 0 && (
                                                    <div className="col-span-full h-full flex flex-col items-center justify-center opacity-30 py-20">
                                                        <ServerIcon className="w-16 h-16 mb-4" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest">Aucun plan d'abonnement</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={subSearch}
                                                        onChange={(e) => {
                                                            setSubSearch(e.target.value);
                                                            if (e.target.value.length > 2 || e.target.value.length === 0) {
                                                                loadSubscriptions(e.target.value);
                                                            }
                                                        }}
                                                        placeholder="Rechercher un client ou un abonnement..."
                                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 pl-12 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                                                    />
                                                    <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
                                                </div>

                                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 pb-12">
                                                    {subLoading ? (
                                                        <div className="flex justify-center py-20">
                                                            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                                        </div>
                                                    ) : (!Array.isArray(subscriptions) || subscriptions.length === 0) ? (
                                                        <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2.5rem] opacity-40">
                                                            <UserGroupIcon className="w-12 h-12 mx-auto mb-4" />
                                                            <p className="text-[10px] font-black uppercase tracking-widest">Aucun abonnement trouvé</p>
                                                        </div>
                                                    ) : (
                                                        subscriptions.map(sub => (
                                                            <div key={sub.id} className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-6">
                                                                <div className="flex justify-between items-start">
                                                                    <div className="flex gap-4">
                                                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-black text-xl">
                                                                            {sub.user?.name?.charAt(0)}
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="font-black text-slate-800 dark:text-white uppercase truncate max-w-[200px]">{sub.user?.name}</h4>
                                                                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{sub.plan?.name}</p>
                                                                            <p className="text-[10px] font-medium text-slate-400 mt-1">Exp: {sub.end_date ? new Date(sub.end_date).toLocaleDateString() : 'N/A'}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                                                        {sub.status === 'active' ? 'Actif' : sub.status}
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-50 dark:border-white/5">
                                                                    {/* RFID Section */}
                                                                    <div className="space-y-3">
                                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Identifiant RFID</label>
                                                                        <div className="flex gap-2">
                                                                            <input
                                                                                type="text"
                                                                                defaultValue={sub.rfid_card_id || ''}
                                                                                placeholder="Scur un badge..."
                                                                                onChange={(e) => setRfidInputs({ ...rfidInputs, [sub.id]: e.target.value })}
                                                                                className="flex-1 bg-slate-50 dark:bg-slate-700/50 border-none rounded-xl py-2.5 px-4 text-xs font-mono outline-none focus:ring-1 focus:ring-indigo-500"
                                                                            />
                                                                            <button
                                                                                onClick={() => handleAssociateRfid(sub.id)}
                                                                                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all"
                                                                            >
                                                                                Associer
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    {/* Delivery Section */}
                                                                    <div className="flex items-end gap-4">
                                                                        <div className="flex-1 space-y-3">
                                                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Livraison Badge</label>
                                                                            <button
                                                                                disabled={sub.delivered_at || !sub.rfid_card_id}
                                                                                onClick={() => handleDeliverSub(sub.id)}
                                                                                className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sub.delivered_at ? 'bg-emerald-500 text-white opacity-50 cursor-not-allowed' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02] active:scale-95'}`}
                                                                            >
                                                                                {sub.delivered_at ? (
                                                                                    <span className="flex items-center justify-center gap-2">
                                                                                        <CheckCircleIcon className="w-4 h-4" />
                                                                                        Livré le {new Date(sub.delivered_at).toLocaleDateString()}
                                                                                    </span>
                                                                                ) : 'Marquer comme livré'}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {viewMode === 'history' && (
                                    <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="flex justify-between items-center mb-10">
                                            <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
                                                <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                                                Transactions de Session
                                            </h2>
                                            <button
                                                onClick={loadHistory}
                                                className="px-5 py-2 bg-slate-50 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-all"
                                            >
                                                Actualiser
                                            </button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                                            {historyLoading ? (
                                                <div className="flex justify-center py-20">
                                                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                                </div>
                                            ) : (!Array.isArray(historyBookings) || historyBookings.length === 0) ? (
                                                <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-30 py-20">
                                                    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-[2rem] flex items-center justify-center">
                                                        <ServerIcon className="w-10 h-10 text-slate-300 dark:text-slate-500" />
                                                    </div>
                                                    <div className="text-center space-y-2">
                                                        <p className="font-black uppercase text-xs tracking-[0.2em] text-slate-800 dark:text-white">Aucun historique disponible</p>
                                                        <p className="text-xs font-medium text-slate-400">Les transactions de ce guichet apparaîtront ici.</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="divide-y dark:divide-slate-700">
                                                    {historyBookings.map((booking: any) => (
                                                        <div key={booking.id} className="py-6 flex justify-between items-center group hover:bg-slate-50/50 dark:hover:bg-slate-700/30 px-4 rounded-2xl transition-all">
                                                            <div className="flex gap-4 items-center">
                                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-black text-xs text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                                    #{booking.booking_reference?.slice(-4)}
                                                                </div>
                                                                <div>
                                                                    <div className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-tight">
                                                                        {booking.user?.name || (booking.tickets?.length > 0 ? booking.tickets[0].passenger_name : 'Client POS')}
                                                                    </div>
                                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                                        {booking.trip?.route?.departure_port?.name} → {booking.trip?.route?.arrival_port?.name}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="font-black text-indigo-600 dark:text-indigo-400 text-sm">
                                                                    {Number(booking.total_amount).toLocaleString()} CFA
                                                                </div>
                                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                                                    {new Date(booking.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Basket & Payment */}
                            <aside className="flex-1 flex flex-col gap-6 min-w-[380px]">
                                {/* Customer Selection */}
                                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-7 shadow-sm border border-slate-200 dark:border-slate-700">
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 italic">Identification Client</label>
                                        <button
                                            onClick={() => {
                                                setShowCreateCustomer(!showCreateCustomer);
                                                if (selectedCustomer) setSelectedCustomer(null);
                                            }}
                                            className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg transition-all ${showCreateCustomer ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                        >
                                            {showCreateCustomer ? 'Recherche' : 'Nouveau +'}
                                        </button>
                                    </div>

                                    {!showCreateCustomer ? (
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={customerSearch}
                                                onChange={e => handleCustomerSearch(e.target.value)}
                                                placeholder="Mobile ou Nom..."
                                                className="w-full bg-slate-50 dark:bg-slate-700/50 border-none rounded-2xl p-4 pl-11 text-sm font-bold outline-none"
                                            />
                                            <MagnifyingGlassIcon className="w-5 h-5 text-slate-300 absolute left-4 top-4" />

                                            {customers.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden divide-y dark:divide-slate-700">
                                                    {customers.map(c => (
                                                        <div
                                                            key={c.id}
                                                            onClick={() => {
                                                                setSelectedCustomer(c);
                                                                setCustomerSearch(c.name);
                                                                setCustomers([]);
                                                                setNewPassenger({ ...newPassenger, name: c.name });
                                                            }}
                                                            className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                                                        >
                                                            <div className="font-bold text-sm">{c.name}</div>
                                                            <div className="text-[10px] font-bold text-indigo-500 mt-0.5">{c.phone || c.email}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <input
                                                type="text"
                                                placeholder="Nom complet *"
                                                value={newCustomerForm.name}
                                                onChange={e => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-indigo-500/20 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            />
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Téléphone"
                                                    value={newCustomerForm.phone}
                                                    onChange={e => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                                                    className="flex-1 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-bold outline-none"
                                                />
                                                <input
                                                    type="email"
                                                    placeholder="Email"
                                                    value={newCustomerForm.email}
                                                    onChange={e => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                                                    className="flex-1 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-bold outline-none"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {selectedCustomer && (
                                        <div className="mt-4 flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                <span className="text-xs font-black text-emerald-700 uppercase">{selectedCustomer.name}</span>
                                            </div>
                                            <button onClick={() => setSelectedCustomer(null)} className="p-1.5 hover:bg-emerald-500/10 rounded-xl transition-colors">
                                                <TrashIcon className="w-4 h-4 text-emerald-600" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Basket & Checkout */}
                                <div className="flex-1 bg-white dark:bg-slate-800 rounded-[3rem] p-8 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col min-h-0 relative overflow-hidden">
                                    {/* Basket Background Pattern */}
                                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>

                                    <div className="flex justify-between items-center mb-8 relative z-10">
                                        <h2 className="text-xl font-black uppercase tracking-tight">Panier</h2>
                                        <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{basket.length} Voyageurs</div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto space-y-4 mb-8 pr-2 custom-scrollbar relative z-10">
                                        {basket.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale">
                                                <ShoppingCartIcon className="w-16 h-16 mb-4" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Panier de vente vide</p>
                                            </div>
                                        ) : (
                                            basket.map(item => (
                                                <div key={item.id} className="group flex items-center justify-between bg-slate-50 dark:bg-slate-700/30 p-5 rounded-3xl border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-all">
                                                    <div className="space-y-1">
                                                        <div className="font-black text-xs uppercase text-slate-800 dark:text-white">{item.name}</div>
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                            {item.type} <span className="mx-1">•</span> {item.nationality_group}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="font-black text-sm text-indigo-600 dark:text-indigo-400">{item.price.toLocaleString()}</span>
                                                        <button onClick={() => removeFromBasket(item.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="border-t-2 border-dashed border-slate-100 dark:border-slate-700/50 pt-8 mt-auto relative z-10">
                                        <div className="flex justify-between items-center mb-8">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Total à encaisser</div>
                                            <div className="text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                                                {totalAmount.toLocaleString()} <span className="text-xs font-bold text-indigo-600">FCFA</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                disabled={loading || basket.length === 0 || (basket.some(i => i.id.startsWith('sub_')) && !selectedCustomer && !showCreateCustomer)}
                                                onClick={() => handleFinalizeSale('cash')}
                                                className="group flex flex-col items-center gap-2.5 p-6 bg-emerald-600 text-white rounded-[2.5rem] font-black shadow-xl shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <BanknotesIcon className="w-8 h-8 opacity-60 group-hover:opacity-100 transition-opacity" />
                                                <span className="text-[9px] uppercase tracking-[0.2em]">Espèces</span>
                                            </button>
                                            <button
                                                disabled={loading || basket.length === 0 || (basket.some(i => i.id.startsWith('sub_')) && !selectedCustomer && !showCreateCustomer)}
                                                onClick={() => handleFinalizeSale('card')}
                                                className="group flex flex-col items-center gap-2.5 p-6 bg-indigo-600 text-white rounded-[2.5rem] font-black shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <CreditCardIcon className="w-8 h-8 opacity-60 group-hover:opacity-100 transition-opacity" />
                                                <span className="text-[9px] uppercase tracking-[0.2em]">Digital / Carte</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </>
                )}
            </main>

            {/* Application Modals */}
            {/* Modal: Ouverture de Caisse */}
            {
                showOpenSessionModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl">
                        <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-12 max-w-md w-full shadow-[0_0_100px_rgba(79,70,229,0.2)] border border-slate-200 dark:border-slate-700">
                            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-indigo-600/30">
                                <BanknotesIcon className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-2">Prise de Poste</h2>
                            <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">L'ouverture de session est requise. Veuillez renseigner le fond de caisse de départ.</p>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Fond de Caisse (FCFA)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={openingAmount}
                                            onChange={e => setOpeningAmount(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-700/50 border-none rounded-2xl p-6 text-3xl font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                        <span className="absolute right-6 top-8 font-black text-slate-300">CFA</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleOpenSession}
                                    disabled={loading}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-6 rounded-2xl uppercase tracking-widest text-[11px] shadow-2xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    {loading ? 'Traitement en cours...' : 'Confirmer et Ouvrir la Caisse'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Modal: Clôture de Session */}
            {
                showCloseSessionModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl">
                        <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-12 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700">
                            <div className="w-20 h-20 bg-rose-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-rose-600/30">
                                <LockClosedIcon className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-2">Clôture Finale</h2>
                            <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">Bilan de la vacation. Déclarer les fonds physiques pour la réconciliation.</p>

                            <div className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-3xl mb-8 border border-slate-100 dark:border-slate-700">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendu Théorique</span>
                                    <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{activeSession?.expected_amount.toLocaleString()} <span className="text-[10px] text-indigo-500 italic">CFA</span></span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Montant Réel Constaté</label>
                                    <input
                                        type="number"
                                        value={closingAmount}
                                        onChange={e => setClosingAmount(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-700/50 border-none rounded-2xl p-5 text-2xl font-black outline-none focus:ring-2 focus:ring-rose-500/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Notes d'Opération (Anomalies...)</label>
                                    <textarea
                                        value={closingNotes}
                                        onChange={e => setClosingNotes(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-700/50 border-none rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-rose-500/20 h-24 resize-none"
                                        placeholder="Préciser si écart ou incident..."
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setShowCloseSessionModal(false)}
                                        className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-black py-5 rounded-2xl uppercase tracking-widest text-[10px]"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleCloseSession}
                                        disabled={loading}
                                        className="flex-[2] bg-rose-600 hover:bg-rose-500 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-[10px] shadow-xl shadow-rose-600/30 transition-all hover:scale-[1.02] active:scale-95"
                                    >
                                        {loading ? 'Clôture...' : 'Confirmer la Fin de Service'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
