import { useState, useEffect } from 'react';
import { apiService, type SubscriptionPlan } from '../../../services/api';
import { IdentificationIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface SubscriptionModalProps {
    userId: string;
    userName: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function SubscriptionModal({ userId, userName, onSuccess, onCancel }: SubscriptionModalProps) {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [subscribing, setSubscribing] = useState(false);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            const data = await apiService.getBadgePlans();
            setPlans(data.plans || []);
        } catch (error) {
            console.error("Error loading plans", error);
            toast.error("Impossible de charger les plans d'abonnement");
        } finally {
            setLoadingPlans(false);
        }
    };

    const handleSubscribe = async () => {
        if (!selectedPlanId) return;
        setSubscribing(true);

        try {
            await apiService.subscribeToPlan({
                plan_id: selectedPlanId,
                payment_method: 'admin_manual',
                delivery_method: 'pickup',
                user_id: userId
            });
            toast.success("Abonnement créé avec succès");
            onSuccess();
        } catch (error: any) {
            console.error("Error subscribing", error);
            toast.error(error.response?.data?.message || "Erreur lors de la création de l'abonnement");
        } finally {
            setSubscribing(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-ocean-50 dark:bg-ocean-500/20 flex items-center justify-center">
                        <IdentificationIcon className="w-6 h-6 text-ocean-600 dark:text-ocean-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Nouvel Abonnement</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mt-0.5">Pour {userName}</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onCancel}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                    <XMarkIcon className="w-6 h-6 text-gray-400" />
                </button>
            </div>

            {loadingPlans ? (
                <div className="py-12 flex justify-center">
                    <div className="w-10 h-10 border-4 border-ocean-500/20 border-t-ocean-500 rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        {plans.map((plan) => (
                            <button
                                key={plan.id}
                                onClick={() => setSelectedPlanId(plan.id.toString())}
                                className={`p-6 rounded-[1.5rem] border-2 text-left transition-all relative overflow-hidden group ${selectedPlanId === plan.id.toString()
                                    ? 'border-ocean-600 bg-ocean-50 dark:bg-ocean-900/20 ring-4 ring-ocean-500/10'
                                    : 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-gray-900/50 hover:border-ocean-300 dark:hover:border-ocean-500/30'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className={`text-xl font-black uppercase tracking-tight ${selectedPlanId === plan.id.toString() ? 'text-ocean-700 dark:text-white' : 'text-gray-900 dark:text-white'}`}>
                                            {plan.name}
                                        </h4>
                                        <p className="text-sm font-bold text-gray-500 mt-1">
                                            {plan.duration_days} jours • {plan.credit_type === 'unlimited' ? 'Voyages illimités' : `${plan.voyage_credits} voyages`}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-ocean-600">{Number(plan.price).toLocaleString()} <span className="text-sm uppercase">F</span></p>
                                    </div>
                                </div>
                                {selectedPlanId === plan.id.toString() && (
                                    <div className="absolute -right-2 -bottom-2 bg-ocean-600 text-white p-3 rounded-tl-3xl shadow-lg">
                                        <CheckCircleIcon className="w-6 h-6" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-end gap-3 mt-10 p-2 bg-gray-50 dark:bg-white/5 rounded-3xl">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-8 py-3.5 text-sm font-black text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all uppercase tracking-widest"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSubscribe}
                            disabled={!selectedPlanId || subscribing}
                            className="bg-ocean-600 hover:bg-ocean-500 dark:bg-ocean-500 dark:hover:bg-ocean-400 text-white px-10 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-ocean-600/20 disabled:opacity-50 active:scale-95 flex items-center gap-2"
                        >
                            {subscribing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    Traitement...
                                </>
                            ) : (
                                "Activer l'Abonnement"
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
