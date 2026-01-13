import { useState, useEffect } from 'react';
import { apiService, type SubscriptionPlan } from '../../../services/api';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface SubscriptionPlanFormProps {
    plan?: SubscriptionPlan | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function SubscriptionPlanForm({ plan, onSuccess, onCancel }: SubscriptionPlanFormProps) {
    const [formData, setFormData] = useState<Partial<SubscriptionPlan>>({
        name: '',
        price: 0,
        duration_days: 365,
        period: 'ANNUEL',
        category: 'BADGE',
        description: '',
        is_active: true,
        voyage_credits: 0,
        credit_type: 'unlimited',
        allow_multi_passenger: true,
    });

    // Manage dynamic features list
    const [featureInput, setFeatureInput] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (plan) {
            setFormData({
                name: plan.name,
                price: plan.price,
                duration_days: plan.duration_days,
                period: plan.period,
                category: plan.category,
                description: plan.description || '',
                features: plan.features || [],
                is_active: plan.is_active,
                voyage_credits: plan.voyage_credits || 0,
                credit_type: plan.credit_type || 'unlimited',
                allow_multi_passenger: plan.allow_multi_passenger ?? true,
            });
        }
    }, [plan]);

    const handleAddFeature = () => {
        if (featureInput.trim()) {
            setFormData(prev => ({
                ...prev,
                features: [...(prev.features || []), featureInput.trim()]
            }));
            setFeatureInput('');
        }
    };

    const handleRemoveFeature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            features: (prev.features || []).filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (plan) {
                await apiService.updateSubscriptionPlan(plan.id, formData);
            } else {
                await apiService.createSubscriptionPlan(formData);
            }
            onSuccess();
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    };

    // Auto-set duration based on period
    useEffect(() => {
        if (formData.period === 'ANNUEL') {
            setFormData(prev => ({ ...prev, duration_days: 365 }));
        } else if (formData.period === 'MENSUEL') {
            setFormData(prev => ({ ...prev, duration_days: 30 }));
        }
    }, [formData.period]);

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                        {plan ? 'Modifier le plan' : 'Nouveau plan d\'abonnement'}
                    </h3>

                    {error && (
                        <div className="mt-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
                        </div>
                    )}

                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        {/* Name */}
                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom du plan</label>
                            <input
                                type="text"
                                required
                                placeholder="Ex: Goreen Adulte"
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm p-2 border"
                                value={formData.name || ''}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        {/* Period */}
                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Période</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm p-2 border"
                                value={formData.period || 'ANNUEL'}
                                onChange={e => setFormData({ ...formData, period: e.target.value as 'ANNUEL' | 'MENSUEL' })}
                            >
                                <option value="ANNUEL">Annuel (365 jours)</option>
                                <option value="MENSUEL">Mensuel (30 jours)</option>
                            </select>
                        </div>

                        {/* Price */}
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prix (FCFA)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm p-2 border"
                                value={formData.price || 0}
                                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            />
                        </div>

                        {/* Category */}
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type d'accès</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm p-2 border"
                                value={formData.category || 'BADGE'}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="BADGE">BADGE</option>
                                <option value="TICKET">TICKET</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm p-2 border"
                                value={formData.is_active ? 'true' : 'false'}
                                onChange={e => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                            >
                                <option value="true">Actif</option>
                                <option value="false">Inactif</option>
                            </select>
                        </div>

                        {/* Credit Type */}
                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Usage du Badge</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm p-2 border"
                                value={formData.credit_type || 'unlimited'}
                                onChange={e => setFormData({ ...formData, credit_type: e.target.value as 'unlimited' | 'counted' })}
                            >
                                <option value="unlimited">Voyages Illimités</option>
                                <option value="counted">Nombre de voyages fixe (Crédits)</option>
                            </select>
                        </div>

                        {/* Voyage Credits */}
                        {formData.credit_type === 'counted' && (
                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de voyages inclus</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    placeholder="Ex: 10"
                                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm p-2 border"
                                    value={formData.voyage_credits || 0}
                                    onChange={e => setFormData({ ...formData, voyage_credits: parseInt(e.target.value) })}
                                />
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Une fois épuisés, le passager devra acheter des recharges ou un nouveau badge.
                                </p>
                            </div>
                        )}

                        {/* Description */}
                        <div className="sm:col-span-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                            <textarea
                                rows={2}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm p-2 border"
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* Allow Multi-passenger */}
                        <div className="sm:col-span-6">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="allow_multi_passenger"
                                    className="h-4 w-4 rounded border-gray-300 text-ocean-600 focus:ring-ocean-500"
                                    checked={formData.allow_multi_passenger ?? true}
                                    onChange={e => setFormData({ ...formData, allow_multi_passenger: e.target.checked })}
                                />
                                <label htmlFor="allow_multi_passenger" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Autoriser l'utilisation pour plusieurs passagers (même réservation)
                                </label>
                            </div>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Si décoché, l'abonnement ne pourra payer que pour le titulaire du compte.
                            </p>
                        </div>

                        {/* Dynamic Features */}
                        <div className="sm:col-span-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Avantages inclus</label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    placeholder="Ex: Accès prioritaire au quai"
                                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm p-2 border"
                                    value={featureInput}
                                    onChange={e => setFeatureInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddFeature}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-ocean-600 hover:bg-ocean-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ocean-500"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Features List */}
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 min-h-[100px] border border-gray-200 dark:border-gray-700">
                                {(!formData.features || formData.features.length === 0) && (
                                    <p className="text-sm text-gray-400 text-center py-2">Aucun avantage ajouté.</p>
                                )}
                                <ul className="space-y-2">
                                    {(formData.features || []).map((feature, idx) => (
                                        <li key={idx} className="flex justify-between items-center bg-white dark:bg-gray-800 p-2 rounded shadow-sm">
                                            <span className="text-sm text-gray-700 dark:text-gray-200">{feature}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFeature(idx)}
                                                className="text-gray-400 hover:text-red-500 transition"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse mt-6 -mx-6 -mb-4 rounded-b-lg">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-ocean-600 text-base font-medium text-white hover:bg-ocean-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ocean-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ocean-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={onCancel}
                >
                    Annuler
                </button>
            </div>
        </form>
    );
}
