import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiService, type Subscription } from '../services/api';
import type { Trip } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
    IdentificationIcon,
    ChevronRightIcon,
    DevicePhoneMobileIcon,
    BanknotesIcon,
    TicketIcon,
    CheckCircleIcon
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
    const { user, login, updateAuthState } = useAuth();

    const tripId = searchParams.get('trip');

    // Booking State
    const [currentStep, setCurrentStep] = useState(1);
    const [trip, setTrip] = useState<Trip | null>(null);
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
            setTrip(data.trip);
        } catch (error) {
            console.error('Error loading trip:', error);
            alert("Ce voyage n'existe plus ou est expiré. Vous allez être redirigé vers l'accueil.");
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
        return passengers.reduce((sum, p) => sum + getPrice(p.type, p.nationality_group), 0);
    };

    const calculateAmountToPay = () => {
        const total = calculateTotal();
        if (selectedSubscriptionId && user) {
            const firstPassengerPrice = getPrice(passengers[0].type, passengers[0].nationality_group);
            return total - firstPassengerPrice;
        }
        return total;
    };

    const getSelectedSubscription = () => {
        return subscriptions.find(s => s.id === selectedSubscriptionId);
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
                }))
            };

            const response = await apiService.createBooking(bookingData);

            if (response.token && response.user) {
                localStorage.setItem('auth_token', response.token);
                updateAuthState(response.token, response.user);
            }

            navigate(`/confirmation/${response.booking.id}`);
        } catch (error: any) {
            console.error('Error creating booking:', error);
            const message = error.response?.data?.message || error.message || 'Erreur inconnue';

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

    const nextStep = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
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
                {/* Progress Steps */}
                <div className="mb-8 hidden md:block">
                    <div className="flex items-center justify-between">
                        {[1, 2, 3, 4].map((step) => (
                            <div key={step} className="flex-1 flex items-center">
                                <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold transition-all duration-300 ${step <= currentStep
                                    ? 'bg-gradient-to-br from-ocean-500 to-ocean-600 text-white shadow-lg scale-110'
                                    : 'bg-white text-gray-400 border-2 border-gray-200'
                                    }`}>
                                    {step < currentStep ? <CheckCircleIcon className="w-6 h-6" /> : step}
                                </div>
                                {step < 4 && (
                                    <div className={`flex-1 h-1 mx-3 transition-all duration-300 ${step < currentStep ? 'bg-gradient-to-r from-ocean-500 to-ocean-600' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trip Summary Card */}
                <div className="card mb-6 border-l-4 border-ocean-500 bg-white shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900">
                                {trip.route.departure_port.name} → {trip.route.arrival_port.name}
                            </h2>
                            <p className="text-gray-600 flex items-center mt-2 text-sm font-medium">
                                {new Date(trip.departure_time).toLocaleDateString('fr-FR', { dateStyle: 'full' })} à {new Date(trip.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">À payer</p>
                            <p className="text-3xl font-black text-ocean-600">{calculateAmountToPay().toLocaleString()} <span className="text-lg">FCFA</span></p>
                            {selectedSubscriptionId && (
                                <p className="text-xs text-green-600 font-bold mt-2 flex items-center justify-end gap-1">
                                    <TicketIcon className="w-4 h-4" />
                                    -{(calculateTotal() - calculateAmountToPay()).toLocaleString()} FCFA (Badge)
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card shadow-2xl shadow-ocean-200/50 bg-white">
                    {/* ÉTAPE 1 : AUTHENTIFICATION */}
                    {currentStep === 1 && (
                        <div className="animate-fade-in">
                            <h3 className="text-3xl font-black mb-8 text-gray-900">Identification</h3>

                            {user ? (
                                <div className="space-y-6">
                                    <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white shadow-lg">
                                            <IdentificationIcon className="w-8 h-8" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-black text-lg text-green-900">Connecté en tant que {user.name}</p>
                                            <p className="text-sm text-green-700 font-medium">{user.email}</p>
                                        </div>
                                    </div>

                                    {subscriptions.length > 0 && (
                                        <div className="p-6 bg-gradient-to-br from-ocean-50 to-ocean-100 border-2 border-ocean-200 rounded-2xl">
                                            <div className="flex items-center gap-3 mb-4">
                                                <TicketIcon className="w-6 h-6 text-ocean-600" />
                                                <h4 className="font-black text-lg text-ocean-900">
                                                    {subscriptions.length} Badge{subscriptions.length > 1 ? 's' : ''} actif{subscriptions.length > 1 ? 's' : ''}
                                                </h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {subscriptions.map(sub => (
                                                    <div key={sub.id} className="p-4 bg-white rounded-xl border-2 border-ocean-100 hover:border-ocean-300 transition">
                                                        <p className="font-bold text-ocean-900">{sub.plan_name}</p>
                                                        <p className="text-sm text-ocean-700 mt-1">
                                                            {sub.current_credit} voyage{sub.current_credit > 1 ? 's' : ''} restant{sub.current_credit > 1 ? 's' : ''}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                        <button onClick={() => setHasAccount(true)} className={`p-8 border-2 rounded-2xl text-left transition-all ${hasAccount === true ? 'border-ocean-500 bg-ocean-50 shadow-xl scale-105' : 'border-gray-200 hover:border-ocean-200'}`}>
                                            <p className="font-black text-xl mb-1">J'ai un compte</p>
                                            <p className="text-sm text-gray-500">Connexion rapide</p>
                                        </button>
                                        <button onClick={() => setHasAccount(false)} className={`p-8 border-2 rounded-2xl text-left transition-all ${hasAccount === false ? 'border-ocean-500 bg-ocean-50 shadow-xl scale-105' : 'border-gray-200 hover:border-ocean-200'}`}>
                                            <p className="font-black text-xl mb-1">Je suis nouveau</p>
                                            <p className="text-sm text-gray-500">Continuer en invité</p>
                                        </button>
                                    </div>

                                    {hasAccount === true && (
                                        <div className="max-w-md mx-auto space-y-4 animate-fade-in p-8 bg-gray-50 rounded-2xl border-2 border-gray-100">
                                            {loginError && <p className="text-red-500 text-sm font-bold text-center bg-red-50 p-3 rounded-lg">{loginError}</p>}
                                            <input type="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="input-field text-lg" />
                                            <input type="password" placeholder="Mot de passe" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="input-field text-lg" />
                                            <button onClick={handleLogin} disabled={isLoggingIn} className="btn-primary w-full py-4 text-lg font-bold">{isLoggingIn ? 'Connexion...' : 'Se connecter'}</button>
                                        </div>
                                    )}

                                    {hasAccount === false && (
                                        <div className="space-y-6 animate-fade-in">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Email de réception</label>
                                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Téléphone</label>
                                                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" placeholder="+221" />
                                                </div>
                                            </div>
                                            <div className="mt-8 pt-8 border-t-2 border-gray-100">
                                                <label className="flex items-center gap-3 cursor-pointer group">
                                                    <input type="checkbox" checked={createAccount} onChange={(e) => setCreateAccount(e.target.checked)} className="w-5 h-5 rounded text-ocean-600 focus:ring-ocean-500" />
                                                    <div>
                                                        <p className="font-bold text-gray-800 group-hover:text-ocean-600 transition">Créer un compte et sauvegarder mes infos</p>
                                                    </div>
                                                </label>
                                                {createAccount && (
                                                    <div className="mt-4 animate-fade-in">
                                                        <label className="block text-sm font-bold text-gray-700 mb-2">Définir un mot de passe</label>
                                                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="8 caractères minimum" />
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
                            <h3 className="text-3xl font-black mb-8 text-gray-900">Passagers</h3>
                            {passengers.map((passenger, index) => (
                                <div key={index} className="mb-6 p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-100 hover:border-ocean-200 transition">
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="font-black text-lg flex items-center gap-3">
                                            <span className="w-10 h-10 rounded-full bg-gradient-to-br from-ocean-500 to-ocean-600 text-white flex items-center justify-center font-bold shadow-lg">{index + 1}</span>
                                            Passager {index + 1}
                                            {index === 0 && user && (
                                                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">Vous</span>
                                            )}
                                        </h4>
                                        {passengers.length > 1 && (
                                            <button onClick={() => removePassenger(index)} className="text-gray-400 hover:text-red-500 transition"><BanknotesIcon className="w-6 h-6" /></button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                                            <select value={passenger.type} onChange={(e) => updatePassenger(index, 'type', e.target.value as any)} className="input-field">
                                                <option value="adult">Adulte</option>
                                                <option value="child">Enfant</option>
                                                <option value="baby">Bébé</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Nationalité</label>
                                            <select value={passenger.nationality_group} onChange={(e) => updatePassenger(index, 'nationality_group', e.target.value as any)} className="input-field">
                                                <option value="national">Sénégalais (National)</option>
                                                <option value="resident">Résident (Sénégal)</option>
                                                <option value="african">Résident Afrique</option>
                                                <option value="hors_afrique">Non-résident Afrique</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Nom complet</label>
                                            <input type="text" value={passenger.name} onChange={(e) => updatePassenger(index, 'name', e.target.value)} placeholder="Prénom NOM" className="input-field" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button onClick={addPassenger} className="w-full py-5 border-2 border-dashed border-ocean-300 rounded-2xl text-ocean-600 font-bold hover:bg-ocean-50 transition-all hover:border-ocean-500">+ Ajouter un passager</button>
                        </div>
                    )}

                    {/* ÉTAPE 3 : VÉRIFICATION */}
                    {currentStep === 3 && (
                        <div className="animate-fade-in">
                            <h3 className="text-3xl font-black mb-8 text-center text-gray-900">Vérification</h3>
                            <div className="bg-gradient-to-br from-ocean-900 to-ocean-800 text-white rounded-3xl p-10 mb-8 relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start border-b border-white/20 pb-6 mb-6">
                                        <div>
                                            <p className="text-ocean-300 text-xs font-bold uppercase tracking-widest mb-3">Passagers</p>
                                            {passengers.map((p, i) => (
                                                <p key={i} className="font-bold text-xl mb-1">{p.name || 'Passager'} <span className="text-sm font-normal text-white/70">({p.type})</span></p>
                                            ))}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-ocean-300 text-xs font-bold uppercase tracking-widest mb-3">Total</p>
                                            <p className="text-4xl font-black">{calculateTotal().toLocaleString()} <span className="text-2xl">FCFA</span></p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-ocean-100 text-sm font-medium">
                                        <ChevronRightIcon className="w-5 h-5" /> Les billets seront envoyés à {email}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ÉTAPE 4 : PAIEMENT MODERNE */}
                    {currentStep === 4 && (
                        <div className="animate-fade-in">
                            <h3 className="text-3xl font-black mb-8 text-center text-gray-900">Paiement sécurisé</h3>

                            {/* Sélection Badge (Multi-abonnements) */}
                            {subscriptions.length > 0 && (
                                <div className="mb-8 p-6 bg-gradient-to-br from-ocean-50 to-ocean-100 border-2 border-ocean-200 rounded-2xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <TicketIcon className="w-6 h-6 text-ocean-600" />
                                        <h4 className="font-black text-lg text-ocean-900">Utiliser un badge</h4>
                                    </div>

                                    {subscriptions.length === 1 ? (
                                        <label className="flex items-start gap-4 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={selectedSubscriptionId === subscriptions[0].id}
                                                onChange={(e) => setSelectedSubscriptionId(e.target.checked ? subscriptions[0].id : null)}
                                                className="w-6 h-6 rounded text-ocean-600 focus:ring-ocean-500 mt-1"
                                            />
                                            <div className="flex-1">
                                                <p className="font-black text-lg text-ocean-900 group-hover:text-ocean-600 transition">
                                                    {subscriptions[0].plan_name}
                                                </p>
                                                <p className="text-sm text-ocean-700 mt-1">
                                                    Votre billet sera payé par le badge. Solde actuel : <span className="font-bold">{parseFloat(subscriptions[0].current_credit).toLocaleString('fr-FR')} FCFA</span>
                                                </p>
                                                <p className="text-xs text-ocean-600 mt-2 italic">
                                                    ⚠️ Le badge s'applique uniquement à votre billet (Passager 1)
                                                </p>
                                            </div>
                                        </label>
                                    ) : (
                                        <select
                                            value={selectedSubscriptionId || ''}
                                            onChange={(e) => setSelectedSubscriptionId(e.target.value || null)}
                                            className="input-field text-lg font-bold"
                                        >
                                            <option value="">Ne pas utiliser de badge</option>
                                            {subscriptions.map(sub => (
                                                <option key={sub.id} value={sub.id}>
                                                    {sub.plan_name} - {parseFloat(sub.current_credit).toLocaleString('fr-FR')} FCFA
                                                </option>
                                            ))}
                                        </select>
                                    )}

                                    {selectedSubscriptionId && (
                                        <div className="mt-4 p-4 bg-white rounded-xl border-2 border-green-200 animate-fade-in">
                                            <p className="text-sm font-bold text-green-700">
                                                ✓ Montant couvert : {(calculateTotal() - calculateAmountToPay()).toLocaleString()} FCFA
                                            </p>
                                            <p className="text-xs text-green-600 mt-1">
                                                Solde après réservation : {(parseFloat(getSelectedSubscription()?.current_credit || 0) - (calculateTotal() - calculateAmountToPay())).toLocaleString('fr-FR')} FCFA
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Méthodes de paiement (MODERNE) */}
                            {calculateAmountToPay() > 0 && (
                                <>
                                    <h4 className="font-black text-xl mb-6 text-gray-900">Choisissez votre moyen de paiement</h4>
                                    <div className="grid grid-cols-2 gap-6 mb-8">
                                        <button
                                            onClick={() => setPaymentMethod('orange_money')}
                                            className={`p-8 border-2 rounded-2xl transition-all duration-300 ${paymentMethod === 'orange_money'
                                                ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-2xl shadow-orange-200 scale-105'
                                                : 'border-gray-200 hover:border-orange-300 hover:shadow-lg'
                                                }`}
                                        >
                                            <div className="flex flex-col items-center gap-4">
                                                <img src="/orange-money-logo.png" alt="Orange Money" className="h-16 object-contain" />
                                                <span className="font-bold text-lg text-gray-900">Orange Money</span>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => setPaymentMethod('wave')}
                                            className={`p-8 border-2 rounded-2xl transition-all duration-300 ${paymentMethod === 'wave'
                                                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-2xl shadow-blue-200 scale-105'
                                                : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
                                                }`}
                                        >
                                            <div className="flex flex-col items-center gap-4">
                                                <img src="/wave-logo.png" alt="Wave" className="h-16 object-contain" />
                                                <span className="font-bold text-lg text-gray-900">Wave</span>
                                            </div>
                                        </button>
                                    </div>

                                    {/* Champ numéro de téléphone */}
                                    <div className="p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200">
                                        <label className="block text-sm font-bold text-gray-700 mb-3">Numéro de paiement</label>
                                        <div className="relative">
                                            <DevicePhoneMobileIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={paymentPhone}
                                                onChange={(e) => setPaymentPhone(e.target.value)}
                                                placeholder="77 123 45 67"
                                                className="input-field pl-14 text-center text-2xl font-black tracking-wider py-5"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-3 text-center">
                                            Vous recevrez une notification sur ce numéro pour confirmer le paiement
                                        </p>
                                    </div>
                                </>
                            )}

                            {/* Bouton de confirmation */}
                            <button
                                onClick={handleSubmit}
                                disabled={processingPayment}
                                className="w-full btn-primary py-6 text-xl mt-8 flex items-center justify-center gap-3 shadow-2xl shadow-ocean-300 font-black disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processingPayment ? (
                                    <>
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                        Traitement en cours...
                                    </>
                                ) : (
                                    <>
                                        {calculateAmountToPay() > 0 ? `Payer ${calculateAmountToPay().toLocaleString()} FCFA` : 'Confirmer la réservation'}
                                        <ChevronRightIcon className="w-6 h-6" />
                                    </>
                                )}
                            </button>

                            {calculateAmountToPay() === 0 && (
                                <p className="text-center text-sm text-green-600 font-bold mt-4 bg-green-50 p-4 rounded-xl">
                                    ✓ Réservation entièrement couverte par votre badge !
                                </p>
                            )}
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="mt-12 pt-8 border-t-2 border-gray-100 flex justify-between">
                        {currentStep > 1 && (
                            <button onClick={prevStep} className="px-8 py-3 text-gray-600 font-bold hover:text-ocean-600 transition-all hover:scale-105">← Précédent</button>
                        )}
                        {currentStep < 4 && (
                            <button onClick={nextStep} className="btn-primary px-12 py-4 ml-auto font-bold text-lg shadow-lg hover:shadow-xl transition-all">Continuer →</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
