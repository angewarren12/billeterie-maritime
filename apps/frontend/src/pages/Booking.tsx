import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiService, type Subscription } from '../services/api';
import type { Trip } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
    IdentificationIcon,
    ChevronRightIcon,
    ChevronLeftIcon,
    DevicePhoneMobileIcon,
    TicketIcon,
    CheckCircleIcon,
    ShieldCheckIcon,
    UserGroupIcon,
    EnvelopeIcon,
    BanknotesIcon,
    CreditCardIcon,
    LockClosedIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';


interface PassengerInfo {
    type: 'adult' | 'child' | 'baby';
    nationality_group: 'national' | 'resident' | 'african' | 'hors_afrique';
    name: string;
    phone: string;
}

export default function Booking() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, login, register, logout } = useAuth();

    const tripId = searchParams.get('trip') || window.location.pathname.split('/').pop();
    const returnTripId = searchParams.get('return_trip_id');

    // Booking State
    const [currentStep, setCurrentStep] = useState(1);
    const [trip, setTrip] = useState<Trip | null>(null);
    const [returnTrip, setReturnTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    const [processingPayment, setProcessingPayment] = useState(false);

    const [passengers, setPassengers] = useState<PassengerInfo[]>([
        { name: '', type: 'adult', nationality_group: 'national', phone: '' }
    ]);

    // Contact State
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    // Auth Check State (Étape 1)
    const [hasAccount, setHasAccount] = useState<boolean | null>(null);
    const [createAccount, setCreateAccount] = useState(false);
    const [password, setPassword] = useState('');
    const [nameForAccount, setNameForAccount] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [registerError, setRegisterError] = useState('');

    // Login State
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [loginError, setLoginError] = useState('');

    // Subscription State (MULTI)
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null);

    // Payment State
    const [paymentMethod, setPaymentMethod] = useState<'orange_money' | 'wave'>('orange_money');
    const [paymentPhone, setPaymentPhone] = useState('');

    useEffect(() => {
        if (tripId) {
            loadTrip();
        } else {
            navigate('/');
        }
    }, [tripId]);

    useEffect(() => {
        if (user) {
            setEmail(user.email);
            setPhone(user.phone || '');
            setHasAccount(false);
            loadSubscriptions();

            // Pré-remplir le premier passager avec les infos du profil
            setPassengers(prev => {
                const newPassengers = [...prev];
                if (newPassengers.length > 0) {
                    // Mapping de sécurité pour nationality
                    let userNat = (user as any).nationality_group || 'national';
                    if (userNat === 'nacional') userNat = 'national'; // Correctif legacy

                    newPassengers[0] = {
                        ...newPassengers[0],
                        name: user.name,
                        phone: user.phone || '',
                        type: (user as any).passenger_type || 'adult',
                        nationality_group: userNat
                    };
                }
                return newPassengers;
            });
        }
    }, [user]);

    const loadTrip = async () => {
        try {
            const data = await apiService.getTrip(tripId!);
            setTrip(data);

            if (returnTripId) {
                const returnData = await apiService.getTrip(returnTripId);
                setReturnTrip(returnData);
            }
        } catch (error) {
            console.error('Error loading trip(s):', error);
            alert("Un des voyages n'existe plus ou est expiré. Vous allez être redirigé vers l'accueil.");
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const loadSubscriptions = async () => {
        try {
            const data = await apiService.getActiveSubscription();
            if (data.has_active_subscription && data.subscriptions) {
                setSubscriptions(data.subscriptions);
            }
        } catch (error) {
            console.log('No active subscription or user not authenticated');
        }
    };

    const addPassenger = () => {
        setPassengers([...passengers, { type: 'adult', nationality_group: 'national', name: '', phone: '' }]);
    };

    const removePassenger = (index: number) => {
        if (passengers.length > 1) {
            setPassengers(passengers.filter((_, i) => i !== index));
        }
    };

    const updatePassenger = (index: number, field: keyof PassengerInfo, value: string) => {
        const updated = [...passengers];
        updated[index] = { ...updated[index], [field]: value };
        setPassengers(updated);
    };

    const getPrice = (type: string, nationality_group: string) => {
        if (type === 'adult') {
            if (nationality_group === 'national' || nationality_group === 'resident') return 1500;
            if (nationality_group === 'african') return 3500;
            if (nationality_group === 'hors_afrique') return 6000;
            return 6000;
        }
        if (type === 'child') {
            if (nationality_group === 'national' || nationality_group === 'resident') return 500;
            if (nationality_group === 'african') return 2000;
            if (nationality_group === 'hors_afrique') return 3000;
            return 3000;
        }
        return 0; // baby
    };

    const calculateTotal = () => {
        const singleTripTotal = passengers.reduce((sum, p) => sum + getPrice(p.type, p.nationality_group), 0);
        return returnTrip ? singleTripTotal * 2 : singleTripTotal;
    };

    const calculateAmountToPay = () => {
        const total = calculateTotal();
        if (selectedSubscriptionId && user) {
            const firstPassengerPrice = getPrice(passengers[0].type, passengers[0].nationality_group);
            return total - firstPassengerPrice;
        }
        return total;
    };



    const handleLogin = async () => {
        setIsLoggingIn(true);
        setLoginError('');
        try {
            await login(loginEmail, loginPassword);
            setHasAccount(false);
            alert("Bienvenue ! Vos informations ont été récupérées.");
        } catch (error: any) {
            setLoginError(error.response?.data?.message || "Email ou mot de passe incorrect.");
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleSubmit = async () => {
        if (!tripId) return;
        setProcessingPayment(true);

        try {
            const bookingData = {
                trip_id: tripId,
                return_trip_id: returnTripId || undefined,
                payment_method: paymentMethod,
                subscription_id: selectedSubscriptionId || undefined,
                create_account: createAccount,
                password: password,
                email: email,
                phone: phone,
                passenger_name_for_account: passengers[0].name,
                passengers: passengers.map(p => ({
                    name: p.name,
                    type: p.type,
                    nationality_group: p.nationality_group,
                    phone: p.phone
                })),
                user_id: searchParams.get('userId') || undefined
            };

            const response = await apiService.createBooking(bookingData);

            if (response.booking && response.user) {
                // If the response returns a user, we might want to update our local state
                // But cookies are handled automatically by the browser
                // updateAuthState(null, response.user); // Optional if updateAuthState supports it
            }

            navigate(`/confirmation/${response.booking.id}`);
        } catch (error: any) {
            console.error('Error creating booking:', error);
            if (error.response) {
                console.log('Server Error Data:', error.response.data);
            }
            const serverMessage = error.response?.data?.message || error.response?.data?.error;
            const message = serverMessage || error.message || 'Erreur inconnue';

            if (error.response?.status === 422) {
                alert(`Données invalides : ${message}`);
                setCurrentStep(2);
            } else {
                alert(`Erreur lors de la réservation : ${message}`);
            }
        } finally {
            setProcessingPayment(false);
        }
    };

    const nextStep = async () => {
        if (currentStep === 1 && !user) {
            // Si l'utilisateur veut créer un compte à cette étape
            if (hasAccount === false && createAccount) {
                if (!nameForAccount || !email || !password) {
                    setRegisterError("Veuillez remplir tous les champs (Nom, Email, Mot de passe)");
                    return;
                }

                setIsRegistering(true);
                setRegisterError('');
                try {
                    // Création du compte utilisateur avant la réservation
                    await register({
                        name: nameForAccount,
                        email,
                        password,
                        password_confirmation: password,
                        phone: phone
                    });

                    // Inscription réussie : on pré-remplit manuellement le passager 1 
                    // pour éviter d'attendre la revalidation SWR
                    setPassengers(prev => {
                        const newPs = [...prev];
                        if (newPs.length > 0) {
                            newPs[0] = { ...newPs[0], name: nameForAccount };
                        }
                        return newPs;
                    });

                    alert("Compte créé avec succès ! Bienvenue.");
                    // Correction: On désactive le flag de création de compte car le compte est DÉJÀ créé.
                    // Sinon l'API tente de le recréer lors du paiement final.
                    setCreateAccount(false);
                    setHasAccount(false); // On considère maintenant qu'il est connecté
                    setCurrentStep(2);
                } catch (error: any) {
                    console.error("🚨 Registration error:", error);

                    // Si c'est une erreur CSRF (419), on réessaye une fois
                    if (error.response?.status === 419) {
                        console.log("🔄 CSRF token mismatch, retrying with fresh token...");
                        try {
                            // Récupérer un nouveau token CSRF
                            await apiService.clearCache();

                            // Réessayer l'inscription
                            await register({
                                name: nameForAccount,
                                email,
                                password,
                                password_confirmation: password,
                                phone: phone
                            });

                            setPassengers(prev => {
                                const newPs = [...prev];
                                if (newPs.length > 0) {
                                    newPs[0] = { ...newPs[0], name: nameForAccount };
                                }
                                return newPs;
                            });

                            alert("Compte créé avec succès ! Bienvenue.");
                            setCreateAccount(false);
                            setHasAccount(false);
                            setCurrentStep(2);
                            return; // Succès après retry
                        } catch (retryError: any) {
                            console.error("❌ Registration retry failed:", retryError);
                            setRegisterError("Erreur de sécurité. Veuillez rafraîchir la page et réessayer.");
                            return;
                        } finally {
                            setIsRegistering(false);
                        }
                    }

                    setRegisterError(error.response?.data?.message || "Erreur lors de la création du compte. L'email est peut-être déjà utilisé.");
                    return;
                } finally {
                    setIsRegistering(false);
                }

            } else if (hasAccount === false && !createAccount) {
                // Mode Invité
                if (!email) {
                    setRegisterError("Veuillez entrer votre email pour continuer");
                    return;
                }
                setCurrentStep(2);
            } else if (hasAccount === true && !user) {
                setLoginError("Veuillez vous connecter pour continuer");
                return;
            } else {
                setCurrentStep(2);
            }
        } else if (currentStep === 2) {
            // VALIDATION ÉTAPE 2 : Vérifier que tous les passagers ont un nom
            const missingNames = passengers.filter(p => !p.name || p.name.trim() === '');
            if (missingNames.length > 0) {
                alert(`⚠️ Veuillez renseigner le nom de tous les passagers (${missingNames.length} nom(s) manquant(s))`);
                return;
            }
            setCurrentStep(3);
        } else if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-ocean-50/30 py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Progress Steps - Mobile Native Style */}
                <div className="mb-10 px-2">
                    <div className="flex items-center justify-between gap-2">
                        {[1, 2, 3, 4].map((step) => (
                            <div key={step} className="flex-1 flex flex-col items-center gap-2">
                                <div className={`h-1.5 w-full rounded-full transition-all duration-700 ${step <= currentStep
                                    ? 'bg-ocean-600 shadow-[0_0_15px_rgba(14,165,233,0.4)]'
                                    : 'bg-gray-200'
                                    }`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${step <= currentStep ? 'text-ocean-600' : 'text-gray-300'}`}>
                                    {step === 1 ? 'ID' : step === 2 ? 'PAX' : step === 3 ? 'CHÉQUIER' : 'PAY'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trip Summary Card - Premium Digital Ticket Style */}
                <div className="relative mb-10 group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-ocean-500 to-primary-600 rounded-[2.6rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                    <div className="relative bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
                        {/* Decorative Ticket Notch */}
                        <div className="hidden md:block absolute top-1/2 -left-4 w-8 h-8 bg-gray-50 rounded-full -translate-y-1/2 border-r border-gray-100"></div>
                        <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-8 bg-gray-50 rounded-full -translate-y-1/2 border-l border-gray-100"></div>

                        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                            <div className="flex-1 p-8 md:p-10 space-y-8">
                                {/* Outward */}
                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-ocean-50 flex items-center justify-center text-ocean-600 shrink-0 shadow-inner">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-ocean-600 uppercase tracking-[0.3em] mb-1">DÉPART ALLER</p>
                                        <h2 className="text-2xl font-black text-gray-900 leading-none mb-2">
                                            {trip.route.departure_port.name} <span className="text-gray-300 mx-2">→</span> {trip.route.arrival_port.name}
                                        </h2>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <p className="text-gray-500 text-sm font-bold flex items-center gap-2">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {new Date(trip.departure_time).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                            </p>
                                            <p className="text-gray-500 text-sm font-bold flex items-center gap-2">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                {new Date(trip.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <span className="px-3 py-1 bg-ocean-50 text-ocean-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-ocean-100">
                                                🚢 {trip.ship?.name}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Divider dotted line for ticket feel */}
                                {returnTrip && <div className="border-t-2 border-dashed border-gray-100 my-2 relative mx-[-40px]"></div>}

                                {/* Return */}
                                {returnTrip && (
                                    <div className="flex flex-col md:flex-row md:items-center gap-6 pt-2">
                                        <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0 shadow-inner">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em] mb-1">DÉPART RETOUR</p>
                                            <h2 className="text-2xl font-black text-gray-900 leading-none mb-2">
                                                {returnTrip.route.departure_port.name} <span className="text-gray-300 mx-2">→</span> {returnTrip.route.arrival_port.name}
                                            </h2>
                                            <div className="flex flex-wrap items-center gap-4">
                                                <p className="text-gray-500 text-sm font-bold flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    {new Date(returnTrip.departure_time).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                                </p>
                                                <p className="text-gray-500 text-sm font-bold flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    {new Date(returnTrip.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <span className="px-3 py-1 bg-primary-50 text-primary-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-primary-100">
                                                    🚢 {returnTrip.ship?.name}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-50/50 lg:bg-transparent lg:border-l lg:border-dashed lg:border-gray-200 p-8 md:p-10 flex flex-col justify-center items-center lg:items-end min-w-[280px]">
                                <div className="text-center lg:text-right">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-black mb-2">TOTAL À PAYER</p>
                                    <p className="text-5xl font-black text-ocean-600 tracking-tighter">
                                        {calculateAmountToPay().toLocaleString()} <span className="text-xl font-bold ml-1">FCFA</span>
                                    </p>
                                    {selectedSubscriptionId && (
                                        <div className="bg-green-100/50 text-green-700 px-4 py-2 rounded-xl text-xs font-black mt-4 flex items-center justify-center lg:justify-end gap-2 border border-green-200">
                                            <TicketIcon className="w-4 h-4" />
                                            ÉCONOMIE BADGE : -{(calculateTotal() - calculateAmountToPay()).toLocaleString()} FCFA
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative group bg-white rounded-[3.5rem] p-4 md:p-8 shadow-[0_50px_100px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-ocean-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
                    {/* ÉTAPE 1 : AUTHENTIFICATION */}
                    {currentStep === 1 && (
                        <div className="animate-fade-in">
                            <h3 className="text-3xl font-black mb-8 text-gray-900 tracking-tighter">Identification</h3>

                            {user ? (
                                <div className="space-y-6">
                                    <div className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100 rounded-[2.5rem] flex items-center gap-6 shadow-sm">
                                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-green-600 shadow-xl shadow-green-200/50 -rotate-3 group-hover:rotate-0 transition-transform">
                                            <IdentificationIcon className="w-8 h-8" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">VOUS ÊTES CONNECTÉ</p>
                                            <p className="font-black text-xl text-gray-900">{user.name}</p>
                                            <p className="text-sm text-gray-500 font-medium">{user.email}</p>
                                        </div>
                                    </div>

                                    {subscriptions.length > 0 && (
                                        <div className="p-8 bg-gradient-to-br from-ocean-50 to-blue-50 border-2 border-ocean-100 rounded-[2.5rem] shadow-sm">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                                    <TicketIcon className="w-5 h-5 text-ocean-600" />
                                                </div>
                                                <h4 className="font-black text-lg text-gray-900">
                                                    Badges disponibles
                                                </h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {subscriptions.map(sub => (
                                                    <div key={sub.id} className="p-5 bg-white rounded-3xl border-2 border-transparent hover:border-ocean-300 transition-all shadow-sm group">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="font-black text-gray-900 group-hover:text-ocean-600 transition">{sub.plan_name}</p>
                                                                <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-widest">
                                                                    {sub.plan.credit_type === 'unlimited' ? (
                                                                        <span className="text-green-600">Illimité</span>
                                                                    ) : sub.voyage_credits_initial > 0 ? (
                                                                        <span>{sub.voyage_credits_remaining} / {sub.voyage_credits_initial} trajets</span>
                                                                    ) : (
                                                                        <span>{Number(sub.legacy_credit_fcfa || 0).toLocaleString()} FCFA</span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedSubscriptionId === sub.id ? 'bg-ocean-600 border-ocean-600 text-white' : 'bg-gray-50 border-gray-200 text-transparent'}`}>
                                                                <CheckCircleIcon className="w-5 h-5" />
                                                            </div>
                                                        </div>
                                                        <input
                                                            type="radio"
                                                            name="subscription"
                                                            className="hidden"
                                                            checked={selectedSubscriptionId === sub.id}
                                                            onChange={() => setSelectedSubscriptionId(selectedSubscriptionId === sub.id ? null : sub.id)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-6 border-t border-gray-100 text-center">
                                        <button
                                            onClick={() => {
                                                logout();
                                                setHasAccount(false);
                                            }}
                                            className="text-[10px] font-black text-red-400 hover:text-red-500 uppercase tracking-widest"
                                        >
                                            Déconnexion / Changer de compte
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                        <button
                                            onClick={() => setHasAccount(true)}
                                            className={`p-10 rounded-[2.5rem] border-3 text-left transition-all duration-500 group relative overflow-hidden ${hasAccount === true ? 'border-ocean-600 bg-ocean-50/50 shadow-2xl scale-[1.02]' : 'border-gray-50 bg-gray-50/50 hover:bg-white hover:border-ocean-100 hover:shadow-xl'}`}
                                        >
                                            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-2xl transition-opacity ${hasAccount === true ? 'bg-ocean-600/10 opacity-100' : 'bg-gray-400/5 opacity-0'}`}></div>
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl transition-all ${hasAccount === true ? 'bg-ocean-600 text-white rotate-3' : 'bg-white text-gray-400'}`}>
                                                <IdentificationIcon className="w-8 h-8" />
                                            </div>
                                            <p className="font-black text-2xl mb-2 text-gray-900 leading-none">J'ai un compte</p>
                                            <p className="text-sm text-gray-500 font-medium">Accès rapide à mes badges</p>
                                        </button>
                                        <button
                                            onClick={() => setHasAccount(false)}
                                            className={`p-10 rounded-[2.5rem] border-3 text-left transition-all duration-500 group relative overflow-hidden ${hasAccount === false ? 'border-ocean-600 bg-ocean-50/50 shadow-2xl scale-[1.02]' : 'border-gray-50 bg-gray-50/50 hover:bg-white hover:border-ocean-100 hover:shadow-xl'}`}
                                        >
                                            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-2xl transition-opacity ${hasAccount === false ? 'bg-ocean-600/10 opacity-100' : 'bg-gray-400/5 opacity-0'}`}></div>
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl transition-all ${hasAccount === false ? 'bg-ocean-600 text-white rotate-3' : 'bg-white text-gray-400'}`}>
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                            </div>
                                            <p className="font-black text-2xl mb-2 text-gray-900 leading-none">Nouveau Client</p>
                                            <p className="text-sm text-gray-500 font-medium">Réserver sans attendre</p>
                                        </button>
                                    </div>

                                    {hasAccount === true && (
                                        <div className="max-w-md mx-auto space-y-6 animate-slide-up bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100">
                                            {loginError && <p className="p-4 bg-red-50 text-red-600 text-xs font-black uppercase text-center rounded-2xl animate-shake">🚨 {loginError}</p>}
                                            <div className="group space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">VOTRE EMAIL</label>
                                                <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="input-field text-lg py-5 px-8" placeholder="email@exemple.com" />
                                            </div>
                                            <div className="group space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">MOT DE PASSE</label>
                                                <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="input-field text-lg py-5 px-8" placeholder="••••••••" />
                                            </div>
                                            <button onClick={handleLogin} disabled={isLoggingIn} className="btn-primary w-full py-5 rounded-2xl text-xs uppercase tracking-[0.3em] font-black shadow-xl shadow-ocean-200">
                                                {isLoggingIn ? 'CONNEXION...' : 'SE CONNECTER'}
                                            </button>
                                        </div>
                                    )}

                                    {hasAccount === false && (
                                        <div className="space-y-8 animate-slide-up">
                                            {registerError && <p className="p-4 bg-red-50 text-red-600 text-xs font-black uppercase text-center rounded-2xl animate-shake">🚨 {registerError}</p>}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {createAccount && (
                                                    <div className="animate-fade-in group space-y-2 md:col-span-2">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">NOM COMPLET</label>
                                                        <input type="text" value={nameForAccount} onChange={(e) => setNameForAccount(e.target.value)} className="input-field py-5 px-8" placeholder="Prénom NOM" />
                                                    </div>
                                                )}

                                                <div className="group space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">EMAIL DE RÉCEPTION</label>
                                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field py-5 px-8" placeholder="votre@email.com" />
                                                </div>
                                                <div className="group space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">TÉLÉPHONE MOBILE</label>
                                                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field py-5 px-8" placeholder="+221" />
                                                </div>
                                            </div>

                                            <div className="pt-8 border-t border-gray-100">
                                                <label className="flex items-center gap-4 cursor-pointer group p-6 bg-gray-50 rounded-[2rem] border-2 border-transparent transition-all hover:bg-white hover:border-ocean-100 hover:shadow-xl">
                                                    <div className={`w-8 h-8 rounded-full border-3 flex items-center justify-center transition-all ${createAccount ? 'bg-ocean-600 border-ocean-600' : 'bg-white border-gray-200'}`}>
                                                        <CheckCircleIcon className={`w-5 h-5 text-white transition-opacity ${createAccount ? 'opacity-100' : 'opacity-0'}`} />
                                                    </div>
                                                    <input type="checkbox" checked={createAccount} onChange={(e) => setCreateAccount(e.target.checked)} className="hidden" />
                                                    <div className="flex-1">
                                                        <p className="font-black text-gray-900 group-hover:text-ocean-600 transition">CRÉER UN COMPTE MEMBRE</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Sauvegarder mes infos et mes badges</p>
                                                    </div>
                                                </label>

                                                {createAccount && (
                                                    <div className="mt-8 animate-fade-in group space-y-2 max-w-md">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">DÉFINIR UN MOT DE PASSE</label>
                                                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field py-5 px-8" placeholder="8 caractères minimum" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* ÉTAPE 2 : PASSAGERS */}
                    {currentStep === 2 && (
                        <div className="animate-fade-in">
                            <h3 className="text-3xl font-black mb-8 text-gray-900 tracking-tighter">Passagers</h3>
                            {passengers.map((passenger, index) => {
                                const passengerPrice = getPrice(passenger.type, passenger.nationality_group);
                                return (
                                    <div key={index} className="mb-10 group active:scale-[0.99] transition-transform duration-500">
                                        <div className="p-10 bg-gray-50/50 rounded-[3rem] border-3 border-transparent group-hover:bg-white group-hover:border-ocean-100 group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] transition-all duration-500">
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-10">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-ocean-100 text-ocean-600 flex items-center justify-center font-black text-xl shadow-inner rotate-3">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-2xl text-gray-900 tracking-tighter">
                                                            {index === 0 && user ? 'Votre Billet' : `Passager ${index + 1}`}
                                                        </h4>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                                            {passenger.name || "NOM À RENSEIGNER"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="hidden md:block text-right">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">TARIF APPLIQUÉ</p>
                                                    <p className="text-2xl font-black text-ocean-600 tracking-tighter">
                                                        {passengerPrice.toLocaleString()} <span className="text-xs">FCFA</span>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Form Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">CATÉGORIE</label>
                                                    <select
                                                        value={passenger.type}
                                                        onChange={(e) => updatePassenger(index, 'type', e.target.value as any)}
                                                        className="input-field font-black text-sm"
                                                    >
                                                        <option value="adult">👤 ADULTE (12+ ANS)</option>
                                                        <option value="child">👶 ENFANT (2-12 ANS)</option>
                                                        <option value="baby">🍼 BÉBÉ (&lt;2 ANS) - GRATUIT</option>
                                                    </select>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">PROFIL RÉSIDENCE</label>
                                                    <select
                                                        value={passenger.nationality_group}
                                                        onChange={(e) => updatePassenger(index, 'nationality_group', e.target.value as any)}
                                                        className="input-field font-black text-sm"
                                                    >
                                                        <option value="national">🇸🇳 NATIONAL SÉNÉGAL</option>
                                                        <option value="resident">🏠 RÉSIDENT SÉNÉGAL</option>
                                                        <option value="african">🌍 RÉSIDENT AFRIQUE</option>
                                                        <option value="hors_afrique">✈️ INTERNATIONAL</option>
                                                    </select>
                                                </div>

                                                <div className="md:col-span-2 space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">PRÉNOM ET NOM</label>
                                                    <input
                                                        type="text"
                                                        value={passenger.name}
                                                        onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                                                        placeholder="Identité complète"
                                                        className="input-field py-5 px-8"
                                                    />
                                                </div>
                                            </div>

                                            {/* Remove Button */}
                                            {passengers.length > 1 && (
                                                <button
                                                    onClick={() => removePassenger(index)}
                                                    className="mt-8 flex items-center gap-2 text-[10px] font-black text-red-400 hover:text-red-500 uppercase tracking-[0.2em] transition-colors ml-4"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    Supprimer ce passager
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            <button
                                onClick={addPassenger}
                                className="w-full py-8 border-3 border-dashed border-gray-100 rounded-[2.5rem] text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] hover:bg-gray-50 transition-all hover:border-ocean-300 hover:text-ocean-600 active:scale-95 flex items-center justify-center gap-4"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                Ajouter un Compagnon
                            </button>

                            {/* Total Summary */}
                            <div className="mt-8 p-8 bg-gradient-to-br from-ocean-900 to-primary-900 rounded-3xl shadow-2xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-ocean-300 text-sm font-bold uppercase tracking-widest mb-2">Total pour {passengers.length} passager{passengers.length > 1 ? 's' : ''}</p>
                                        <p className="text-white text-xl font-medium">
                                            {passengers.map(p => `${p.name || 'Anonyme'}`).join(', ')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-5xl font-black text-white">
                                            {calculateTotal().toLocaleString()}
                                        </p>
                                        <p className="text-ocean-200 text-lg font-bold mt-1">FCFA</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ÉTAPE 3 : VÉRIFICATION - TICKET STYLE */}
                    {currentStep === 3 && (
                        <div className="animate-fade-in space-y-10">
                            <div className="flex items-center justify-between">
                                <h3 className="text-3xl font-black text-gray-900 tracking-tighter">Vérification</h3>
                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                    <ShieldCheckIcon className="w-4 h-4" />
                                    Données sécurisées
                                </div>
                            </div>

                            <div className="bg-white rounded-[3.5rem] p-4 md:p-12 shadow-[0_40px_80px_rgba(0,0,0,0.06)] border border-gray-100 relative overflow-hidden group">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-ocean-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-40"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-ocean-50 rounded-full blur-3xl -ml-24 -mb-24 opacity-40"></div>

                                <div className="relative z-10 space-y-12">
                                    {/* Passengers Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 text-gray-400">
                                            <UserGroupIcon className="w-6 h-6" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em]">LISTE DES VOYAGEURS</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {passengers.map((p, i) => (
                                                <div key={i} className="flex items-center gap-6 p-6 bg-gray-50/50 rounded-3xl border border-transparent hover:border-ocean-100 hover:bg-white transition-all duration-300">
                                                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-ocean-600 font-black text-xl rotate-3 group-hover:rotate-0 transition-transform">
                                                        {i + 1}
                                                    </div>
                                                    <div>
                                                        <p className="text-xl font-black text-gray-900 tracking-tighter">{p.name || 'Passager'}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] font-black text-ocean-600 uppercase tracking-widest">{p.type}</span>
                                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.nationality_group.replace('_', ' ')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Confirmation Details */}
                                    <div className="pt-10 border-t border-dashed border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-3xl bg-ocean-50 flex items-center justify-center text-ocean-600">
                                                <EnvelopeIcon className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ENVOI DES BILLETS</p>
                                                <p className="text-xl font-black text-gray-900 break-all">{email}</p>
                                                <p className="text-xs font-medium text-gray-500 mt-1 italic">Vérifiez bien l'orthographe</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 p-8 bg-gradient-to-br from-ocean-900 to-primary-900 rounded-[2.5rem] text-white shadow-2xl">
                                            <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center">
                                                <BanknotesIcon className="w-8 h-8 text-ocean-300" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-ocean-300 uppercase tracking-widest mb-1">TOTAL À RÉGLER</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-4xl font-black tracking-tighter">{calculateTotal().toLocaleString()}</span>
                                                    <span className="text-sm font-black text-ocean-300">FCFA</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-5 bg-ocean-50/50 rounded-2xl border border-ocean-100">
                                        <SparklesIcon className="w-5 h-5 text-ocean-500 animate-pulse" />
                                        <p className="text-sm font-medium text-ocean-900">
                                            En continuant, vous confirmez que les informations ci-dessus sont exactes. Une fois le paiement validé, vos billets seront générés instantanément.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ÉTAPE 4 : PAIEMENT MODERNE PREMIUM */}
                    {currentStep === 4 && (
                        <div className="animate-fade-in space-y-12">
                            <div className="text-center space-y-2">
                                <h3 className="text-3xl font-black text-gray-900 tracking-tighter">Paiement sécurisé</h3>
                                <p className="text-gray-500 font-medium">Choisissez votre méthode de règlement préférée</p>
                            </div>

                            {/* Sélection Badge / Chéquier */}
                            {subscriptions.length > 0 && (
                                <div className="p-8 bg-gradient-to-br from-ocean-50 to-white border-2 border-ocean-100 rounded-[3rem] shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-ocean-200/20 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-ocean-300/30 transition-colors"></div>

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-ocean-600 shadow-sm">
                                                <TicketIcon className="w-6 h-6" />
                                            </div>
                                            <h4 className="font-black text-xl text-gray-900 uppercase tracking-tight">Utiliser mon Badge</h4>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            {subscriptions.map(sub => (
                                                <label
                                                    key={sub.id}
                                                    className={`relative p-8 rounded-[2rem] border-3 transition-all cursor-pointer group/item ${selectedSubscriptionId === sub.id
                                                        ? 'border-ocean-600 bg-white shadow-xl scale-[1.02]'
                                                        : 'border-gray-100 bg-gray-50/50 hover:bg-white hover:border-ocean-200'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="subscription"
                                                        value={sub.id}
                                                        checked={selectedSubscriptionId === sub.id}
                                                        onChange={() => setSelectedSubscriptionId(sub.id)}
                                                        className="sr-only"
                                                    />
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-6">
                                                            <div className={`w-10 h-10 rounded-full border-3 flex items-center justify-center transition-all ${selectedSubscriptionId === sub.id ? 'bg-ocean-600 border-ocean-600 text-white' : 'border-gray-200'
                                                                }`}>
                                                                <CheckCircleIcon className="w-6 h-6" />
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-xl text-gray-900 tracking-tight">{sub.plan_name}</p>
                                                                <p className="text-xs font-bold text-ocean-600 mt-1 uppercase tracking-widest">
                                                                    Solde : {
                                                                        sub.plan.credit_type === 'unlimited' ? 'ILLIMITÉ' :
                                                                            sub.voyage_credits_initial > 0 ? `${sub.voyage_credits_remaining} voyages` :
                                                                                `${Number(sub.legacy_credit_fcfa || 0).toLocaleString()} FCFA`
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {selectedSubscriptionId === sub.id && (
                                                            <div className="text-right hidden sm:block">
                                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">DÉDUCTION APPLIQUÉE</p>
                                                                <p className="text-xl font-black text-emerald-600 flex items-center gap-2">
                                                                    -{(calculateTotal() - calculateAmountToPay()).toLocaleString()} <span className="text-xs">FCFA</span>
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </label>
                                            ))}

                                            <button
                                                onClick={() => setSelectedSubscriptionId(null)}
                                                className={`mt-4 w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:text-ocean-600 ${!selectedSubscriptionId ? 'text-ocean-600 underline' : 'text-gray-400'}`}
                                            >
                                                Ne pas utiliser de badge pour cette fois
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Méthodes de paiement (OM / WAVE) */}
                            {calculateAmountToPay() > 0 && (
                                <div className="space-y-10">
                                    <div className="flex items-center gap-6">
                                        <div className="flex-1 h-px bg-gray-100"></div>
                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">PAIEMENT MOBILE</p>
                                        <div className="flex-1 h-px bg-gray-100"></div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <button
                                            onClick={() => setPaymentMethod('orange_money')}
                                            className={`group relative p-10 rounded-[3rem] border-3 transition-all duration-500 overflow-hidden ${paymentMethod === 'orange_money'
                                                ? 'border-orange-500 bg-orange-50/50 shadow-2xl scale-105'
                                                : 'border-gray-100 bg-gray-50/50 hover:bg-white hover:border-orange-200'
                                                }`}
                                        >
                                            <div className="relative z-10 flex flex-col items-center gap-6">
                                                <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center p-4">
                                                    <img src="/orange-money-logo.png" alt="Orange Money" className="w-full h-full object-contain" />
                                                </div>
                                                <span className="font-black text-xl text-gray-900 tracking-tighter">Orange Money</span>
                                            </div>
                                            {paymentMethod === 'orange_money' && (
                                                <div className="absolute top-4 right-4 text-orange-600">
                                                    <CheckCircleIcon className="w-8 h-8 fill-orange-50" />
                                                </div>
                                            )}
                                        </button>

                                        <button
                                            onClick={() => setPaymentMethod('wave')}
                                            className={`group relative p-10 rounded-[3rem] border-3 transition-all duration-500 overflow-hidden ${paymentMethod === 'wave'
                                                ? 'border-blue-500 bg-blue-50/50 shadow-2xl scale-105'
                                                : 'border-gray-100 bg-gray-50/50 hover:bg-white hover:border-blue-200'
                                                }`}
                                        >
                                            <div className="relative z-10 flex flex-col items-center gap-6">
                                                <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center p-4">
                                                    <img src="/wave-logo.png" alt="Wave" className="w-full h-full object-contain" />
                                                </div>
                                                <span className="font-black text-xl text-gray-900 tracking-tighter">Wave</span>
                                            </div>
                                            {paymentMethod === 'wave' && (
                                                <div className="absolute top-4 right-4 text-blue-600">
                                                    <CheckCircleIcon className="w-8 h-8 fill-blue-50" />
                                                </div>
                                            )}
                                        </button>
                                    </div>

                                    {/* Phone Number Input */}
                                    <div className="relative group max-w-xl mx-auto">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-ocean-500 to-primary-600 rounded-[3rem] blur opacity-10 group-focus-within:opacity-20 transition duration-1000"></div>
                                        <div className="relative bg-white rounded-[2.5rem] border-2 border-gray-100 focus-within:border-ocean-500 transition-all shadow-xl p-8">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-3 block">NUMÉRO À DÉBITER</label>
                                            <div className="relative flex items-center">
                                                <DevicePhoneMobileIcon className="absolute left-6 w-8 h-8 text-gray-300 group-focus-within:text-ocean-500 transition-colors" />
                                                <input
                                                    type="tel"
                                                    value={paymentPhone}
                                                    onChange={(e) => setPaymentPhone(e.target.value)}
                                                    placeholder="+221 7X XXX XX XX"
                                                    className="w-full bg-transparent border-none focus:ring-0 text-3xl font-black tracking-[0.1em] pl-20 py-4 text-gray-900"
                                                />
                                            </div>
                                            <div className="mt-6 flex items-start gap-3 bg-gray-50 p-5 rounded-2xl">
                                                <div className="w-6 h-6 rounded-full bg-ocean-100 flex items-center justify-center shrink-0 mt-0.5">
                                                    <LockClosedIcon className="w-4 h-4 text-ocean-600" />
                                                </div>
                                                <p className="text-xs font-medium text-gray-500 leading-relaxed">
                                                    Une notification de confirmation apparaîtra sur votre téléphone pour valider la transaction de <span className="font-black text-gray-900">{calculateAmountToPay().toLocaleString()} FCFA</span>.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Final Call to Action */}
                            <div className="pt-8 text-center space-y-6">
                                <button
                                    onClick={handleSubmit}
                                    disabled={processingPayment}
                                    className="group relative inline-flex items-center justify-center p-1 px-12 py-8 overflow-hidden font-black text-white transition duration-300 ease-out rounded-full shadow-2xl group w-full max-w-lg"
                                >
                                    <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-ocean-600 via-primary-600 to-ocean-700"></span>
                                    <span className="absolute bottom-0 right-0 block w-96 h-96 mb-32 mr-4 transition duration-500 origin-bottom-left transform rotate-45 translate-x-24 bg-primary-400 opacity-20 group-hover:rotate-90 ease"></span>

                                    <div className="relative flex items-center gap-4">
                                        {processingPayment ? (
                                            <>
                                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-white/30"></div>
                                                <span className="text-2xl tracking-tighter uppercase">Traitement...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-2xl tracking-tighter uppercase">
                                                    {calculateAmountToPay() > 0 ? `PAYER ${calculateAmountToPay().toLocaleString()} FCFA` : 'CONFIRMER RÉSERVATION'}
                                                </span>
                                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all">
                                                    <CreditCardIcon className="w-6 h-6" />
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Shimmer effect */}
                                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-40 animate-shimmer" />
                                </button>

                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                                    <ShieldCheckIcon className="w-4 h-4" /> Transactions 100% sécurisées via SSL
                                </p>
                            </div>
                        </div>
                    )}

                    {/* NAVIGATION - FIXED BOTTOM DOCK */}
                    <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-gray-100/50 z-50 md:relative md:bg-transparent md:border-none md:p-0 md:mt-16">
                        <div className="max-w-5xl mx-auto flex justify-between items-center">
                            {currentStep > 1 ? (
                                <button
                                    onClick={prevStep}
                                    className="group flex items-center gap-4 px-8 py-5 text-gray-400 hover:text-ocean-600 font-black transition-all"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-ocean-50 group-active:scale-90 transition-all">
                                        <ChevronLeftIcon className="w-6 h-6" />
                                    </div>
                                    <span className="hidden sm:inline tracking-widest text-xs">RETOUR</span>
                                </button>
                            ) : <div></div>}

                            {currentStep < 4 && (
                                <button
                                    onClick={nextStep}
                                    disabled={isRegistering}
                                    className="btn-primary group relative px-12 py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-ocean-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-4 ml-auto"
                                >
                                    {isRegistering ? (
                                        <>
                                            <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-white/30"></div>
                                            <span>CRÉATION...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="tracking-tight">CONTINUER</span>
                                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                                <ChevronRightIcon className="w-5 h-5" />
                                            </div>
                                        </>
                                    )}
                                    {/* Subtle pulse effect for the CTA */}
                                    <span className="absolute inset-0 rounded-[2rem] bg-white/20 animate-ping opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
