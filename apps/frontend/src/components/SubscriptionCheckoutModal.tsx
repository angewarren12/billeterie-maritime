import { useState } from 'react';
import {
    XMarkIcon,
    CreditCardIcon,
    HomeIcon,
    CheckCircleIcon,
    ArrowRightIcon,
    TruckIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../services/api';

interface SubscriptionCheckoutModalProps {
    plan: any;
    onClose: () => void;
    onSuccess: () => void;
}

const SubscriptionCheckoutModal = ({ plan, onClose, onSuccess }: SubscriptionCheckoutModalProps) => {
    const [step, setStep] = useState<'delivery' | 'payment' | 'success'>('delivery');
    const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('orange_money'); // default
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await apiService.subscribeToPlan({
                plan_id: plan.id,
                payment_method: paymentMethod,
                delivery_method: deliveryMethod,
                delivery_address: deliveryMethod === 'delivery' ? address : undefined
            });
            setStep('success');
        } catch (error) {
            console.error("Subscription error", error);
            alert("Erreur lors de la souscription. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    if (step === 'success') {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                <div className="bg-white rounded-[3rem] p-10 max-w-md w-full text-center space-y-6 shadow-2xl animate-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-100">
                        <CheckCircleIcon className="w-12 h-12" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900">Abonnement Confirmé !</h3>
                        <p className="text-gray-500 font-medium mt-2">Votre badge maritime est en cours de préparation.</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-6 text-left border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan</span>
                            <span className="text-sm font-black text-gray-900">{plan.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mode</span>
                            <span className="text-sm font-black text-ocean-600 uppercase italic">
                                {deliveryMethod === 'delivery' ? 'Livraison à domicile' : 'Retrait au port'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            onSuccess();
                            onClose();
                        }}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition shadow-xl"
                    >
                        Accéder à mon badge
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-[3rem] max-w-lg w-full overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 leading-none">Commander mon Badge</h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Formule {plan.period}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8">
                    {/* Progress Bar */}
                    <div className="flex items-center gap-2 mb-10">
                        <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step === 'delivery' ? 'bg-ocean-600' : 'bg-green-500'}`}></div>
                        <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step === 'payment' ? 'bg-ocean-600' : 'bg-gray-100'}`}></div>
                    </div>

                    {step === 'delivery' ? (
                        <div className="space-y-8">
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-black text-gray-900">Comment obtenir votre carte ?</h3>
                                <p className="text-sm text-gray-500 font-medium">Choisissez le mode de retrait de votre badge physique RFID.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <button
                                    onClick={() => setDeliveryMethod('pickup')}
                                    className={`relative flex items-center gap-4 p-6 rounded-3xl border-2 transition-all text-left ${deliveryMethod === 'pickup' ? 'border-ocean-600 bg-ocean-50/30' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${deliveryMethod === 'pickup' ? 'bg-ocean-600 text-white' : 'bg-gray-50 text-gray-400'}`}>
                                        <HomeIcon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-gray-900">Retrait au Port (Gratuit)</p>
                                        <p className="text-xs text-gray-500 font-medium">Disponible sous 24h à n'importe quel guichet.</p>
                                    </div>
                                    {deliveryMethod === 'pickup' && <CheckCircleIcon className="w-6 h-6 text-ocean-600" />}
                                </button>

                                <button
                                    onClick={() => setDeliveryMethod('delivery')}
                                    className={`relative flex items-center gap-4 p-6 rounded-3xl border-2 transition-all text-left ${deliveryMethod === 'delivery' ? 'border-ocean-600 bg-ocean-50/30' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${deliveryMethod === 'delivery' ? 'bg-ocean-600 text-white' : 'bg-gray-50 text-gray-400'}`}>
                                        <TruckIcon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-gray-900">Livraison Express</p>
                                        <p className="text-xs text-gray-500 font-medium">À votre domicile ou bureau (Dakar & Banlieue).</p>
                                    </div>
                                    {deliveryMethod === 'delivery' && <CheckCircleIcon className="w-6 h-6 text-ocean-600" />}
                                </button>
                            </div>

                            {deliveryMethod === 'delivery' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-2">Adresse de livraison</label>
                                    <textarea
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Ex: Sacré-Cœur 3, Villa 123, Dakar..."
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-ocean-600 outline-none transition-all h-24"
                                    />
                                </div>
                            )}

                            <button
                                onClick={() => setStep('payment')}
                                disabled={deliveryMethod === 'delivery' && !address}
                                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                Continuer vers le paiement
                                <ArrowRightIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-black text-gray-900">Résumé & Paiement</h3>
                                <p className="text-sm text-gray-500 font-medium">Finalisez votre commande en toute sécurité.</p>
                            </div>

                            <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-bold text-sm">Badge {plan.name}</span>
                                        <span className="font-black text-gray-900">{Number(plan.price).toLocaleString()} FCFA</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-bold text-sm">Frais de service</span>
                                        <span className="font-black text-gray-900">0 FCFA</span>
                                    </div>
                                    <div className="h-px bg-gray-200 my-4"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-black text-gray-900">Total à payer</span>
                                        <span className="text-2xl font-black text-ocean-600">{Number(plan.price).toLocaleString()} FCFA</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-2">Méthode de paiement</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setPaymentMethod('orange_money')}
                                        className={`p-6 border-2 rounded-2xl transition-all duration-300 ${paymentMethod === 'orange_money' ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-xl shadow-orange-200 scale-105' : 'border-gray-200 hover:border-orange-300 hover:shadow-lg'}`}
                                    >
                                        <div className="flex flex-col items-center gap-3">
                                            <img src="/orange-money-logo.png" alt="Orange Money" className="h-12 object-contain" />
                                            <span className="font-bold text-sm text-gray-900">Orange Money</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setPaymentMethod('wave')}
                                        className={`p-6 border-2 rounded-2xl transition-all duration-300 ${paymentMethod === 'wave' ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-xl shadow-blue-200 scale-105' : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'}`}
                                    >
                                        <div className="flex flex-col items-center gap-3">
                                            <img src="/wave-logo.png" alt="Wave" className="h-12 object-contain" />
                                            <span className="font-bold text-sm text-gray-900">Wave</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setStep('delivery')}
                                    className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition"
                                >
                                    Retour
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex-[2] py-4 bg-ocean-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-ocean-700 transition shadow-xl shadow-ocean-100 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            Payer & Activer
                                            <CreditCardIcon className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionCheckoutModal;
