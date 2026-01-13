import { useState, useEffect } from 'react';
import { apiService, type SubscriptionPlan } from '../../../services/api';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    CheckBadgeIcon,
    TicketIcon,
    TableCellsIcon,
    Squares2X2Icon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import SubscriptionPlanForm from './SubscriptionPlanForm';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const PlanCard = ({ plan, onEdit, onDelete, canManage }: {
    plan: SubscriptionPlan;
    onEdit: (plan: SubscriptionPlan) => void;
    onDelete: (id: number) => void;
    canManage: boolean;
}) => (
    <div key={plan.id} className={`group relative bg-white dark:bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border ${plan.is_active ? 'border-gray-200 dark:border-gray-700' : 'border-red-200 dark:border-red-900/50 opacity-75'} shadow-lg hover:shadow-xl hover:border-ocean-500/30 dark:hover:border-ocean-400/30 transition-all duration-300`}>
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${plan.period === 'ANNUEL' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                {plan.category?.includes('BADGE') || plan.name?.includes('BADGE') ? (
                    <CheckBadgeIcon className="w-6 h-6" />
                ) : (
                    <TicketIcon className="w-6 h-6" />
                )}
            </div>
            <div className="text-right">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{plan.price?.toLocaleString() || 0} FCFA</span>
                <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {plan.period === 'ANNUEL' ? '/ an' : '/ mois'}
                </span>
            </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-ocean-500 transition-colors">
            {plan.name}
        </h3>

        <div className="min-h-[60px]">
            {plan.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                    {plan.description}
                </p>
            )}
            <div className="flex items-center gap-2 mb-3">
                {plan.credit_type === 'unlimited' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        Voyages Illimités
                    </span>
                ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-ocean-100 text-ocean-700 dark:bg-ocean-900/30 dark:text-ocean-400">
                        {plan.voyage_credits} Voyages inclus
                    </span>
                )}
            </div>
        </div>

        {/* Features Preview */}
        <div className="space-y-2 mb-6">
            {plan.features?.slice(0, 3).map((feature, idx) => (
                <div key={idx} className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-ocean-500 mr-2"></span>
                    {feature}
                </div>
            ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${plan.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                {plan.is_active ? 'Actif' : 'Inactif'}
            </span>
            {canManage && (
                <div className="flex gap-2">
                    <button onClick={() => onEdit(plan)} className="p-2 text-gray-500 hover:text-ocean-600 hover:bg-ocean-50 dark:hover:bg-ocean-900/30 rounded-lg transition-colors">
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => onDelete(plan.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    </div>
);

const PlanTableView = ({ plans, onEdit, onDelete, canManage }: {
    plans: SubscriptionPlan[];
    onEdit: (plan: SubscriptionPlan) => void;
    onDelete: (id: number) => void;
    canManage: boolean;
}) => (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-white/5 backdrop-blur-sm">
        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Plan</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Prix</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Période</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Statut</th>
                    {canManage && <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>}
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-transparent">
                {plans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                            <div className="flex items-center">
                                <div className={`h-10 w-10 flex-shrink-0 rounded-lg flex items-center justify-center ${plan.period === 'ANNUEL' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                                    {plan.category?.includes('BADGE') || plan.name?.includes('BADGE') ? (
                                        <CheckBadgeIcon className="w-6 h-6" />
                                    ) : (
                                        <TicketIcon className="w-6 h-6" />
                                    )}
                                </div>
                                <div className="ml-4">
                                    <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                        {plan.name}
                                        {plan.credit_type === 'unlimited' ? (
                                            <span className="text-[8px] font-black uppercase tracking-tighter bg-purple-50 text-purple-600 px-1 rounded border border-purple-100">∞</span>
                                        ) : (
                                            <span className="text-[8px] font-black uppercase tracking-tighter bg-ocean-50 text-ocean-600 px-1 rounded border border-ocean-100">{plan.voyage_credits}V</span>
                                        )}
                                    </div>
                                    <div className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 max-w-xs truncate">{plan.description}</div>
                                </div>
                            </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-bold text-gray-900 dark:text-white">
                            {plan.price?.toLocaleString() || 0} FCFA
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {plan.period}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${plan.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                {plan.is_active ? 'Actif' : 'Inactif'}
                            </span>
                        </td>
                        {canManage && (
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => onEdit(plan)} className="text-ocean-600 dark:text-ocean-400 hover:text-ocean-900 dark:hover:text-ocean-300 transition-colors bg-ocean-50 dark:bg-ocean-900/20 p-2 rounded-lg">
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => onDelete(plan.id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default function ListSubscriptionPlans() {
    const { user } = useAuth();
    const canManage = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager';
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        const start = performance.now();
        try {
            const data = await apiService.getSubscriptionPlans();
            const totalTime = Math.round(performance.now() - start);
            console.log(`📋 [Plans] Chargé en ${totalTime}ms (Backend: ${data.internal_time_ms}ms)`);
            setPlans(data.data || []);
        } catch (error) {
            console.error("Failed to load plans", error);
            toast.error("Impossible de charger les plans.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingPlan(null);
        setIsModalOpen(true);
    };

    const handleEdit = (plan: SubscriptionPlan) => {
        setEditingPlan(plan);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce plan ?')) {
            try {
                await apiService.deleteSubscriptionPlan(id);
                toast.success("Plan supprimé/désactivé avec succès");
                loadPlans();
            } catch (error) {
                console.error("Failed to delete plan", error);
                toast.error("Erreur lors de la suppression.");
            }
        }
    };

    const handleFormSuccess = () => {
        setIsModalOpen(false);
        loadPlans();
        toast.success(editingPlan ? "Plan modifié avec succès" : "Plan créé avec succès");
    };

    // Filtering
    const filteredPlans = plans.filter(plan =>
        plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Grouping by Period for better display
    const annualPlans = filteredPlans.filter(p => p.period === 'ANNUEL');
    const monthlyPlans = filteredPlans.filter(p => p.period === 'MENSUEL');

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn pb-12">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                        Plans d'Abonnement
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Gérez les offres d'accès annuelles et mensuelles.
                    </p>
                </div>
                {canManage && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCreate}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-ocean-600 rounded-lg hover:bg-ocean-500 shadow-lg shadow-ocean-500/30 transition"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Nouveau Plan
                        </button>
                    </div>
                )}
            </div>

            {/* Controls Bar */}
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">
                <div className="relative w-full sm:w-80">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 font-bold" />
                    <input
                        type="text"
                        placeholder="Rechercher un plan..."
                        className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl py-2.5 pl-12 pr-4 outline-none focus:ring-4 focus:ring-ocean-500/10 focus:border-ocean-500 transition-all font-medium text-sm text-gray-900 dark:text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center bg-gray-100 dark:bg-gray-700/50 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm text-ocean-600 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                        title="Vue Liste"
                    >
                        <TableCellsIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm text-ocean-600 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                        title="Vue Carte"
                    >
                        <Squares2X2Icon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {viewMode === 'list' ? (
                <PlanTableView plans={filteredPlans} onEdit={handleEdit} onDelete={handleDelete} canManage={canManage} />
            ) : (
                <>
                    {/* Annual Plans */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="w-2 h-8 rounded-full bg-amber-500"></span>
                            Abonnements Annuels
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {annualPlans.map(plan => (
                                <PlanCard
                                    key={plan.id}
                                    plan={plan}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    canManage={canManage}
                                />
                            ))}
                            {annualPlans.length === 0 && (
                                <div className="col-span-full py-10 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border-dashed border-2 border-gray-200 dark:border-gray-700">
                                    Aucun plan annuel configuré.
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Monthly Plans */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="w-2 h-8 rounded-full bg-blue-500"></span>
                            Abonnements Mensuels
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {monthlyPlans.map(plan => (
                                <PlanCard
                                    key={plan.id}
                                    plan={plan}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    canManage={canManage}
                                />
                            ))}
                            {monthlyPlans.length === 0 && (
                                <div className="col-span-full py-10 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border-dashed border-2 border-gray-200 dark:border-gray-700">
                                    Aucun plan mensuel configuré.
                                </div>
                            )}
                        </div>
                    </section>
                </>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-200 dark:border-gray-700">
                            <SubscriptionPlanForm
                                plan={editingPlan}
                                onSuccess={handleFormSuccess}
                                onCancel={() => setIsModalOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
