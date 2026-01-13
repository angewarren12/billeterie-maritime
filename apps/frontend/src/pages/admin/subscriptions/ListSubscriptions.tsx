import { useState, useEffect } from 'react';
import { apiService } from '../../../services/api';
import {
    MagnifyingGlassIcon,
    TableCellsIcon,
    Squares2X2Icon,
    CreditCardIcon,
    IdentificationIcon,
    CheckCircleIcon,
    XCircleIcon,
    UserIcon,
    CalendarIcon,
    ClockIcon,
    LifebuoyIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface Subscription {
    id: string;
    user: {
        name: string;
        email: string;
    };
    plan: {
        name: string;
        price: number;
        credit_type: string;
    };
    rfid_card_id: string;
    start_date: string;
    end_date: string;
    status: 'active' | 'blocked' | 'expired';
    voyage_credits_remaining: number;
    legacy_credit_fcfa: string;
    is_delivered: boolean;
    delivered_at: string | null;
}

export default function ListSubscriptions() {
    const { user } = useAuth();
    const canManage = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager';
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('active');

    // Modal states
    const [showAssociaterModal, setShowAssociateModal] = useState(false);
    const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
    const [rfidInput, setRfidInput] = useState('');

    useEffect(() => {
        loadSubscriptions();
    }, [searchQuery, statusFilter]);

    const loadSubscriptions = async () => {
        const start = performance.now();
        try {
            setLoading(true);
            const response = await apiService.getAdminSubscriptions({
                search: searchQuery,
                status: statusFilter
            });
            const totalTime = Math.round(performance.now() - start);
            console.log(`💳 [Subscriptions] Chargé en ${totalTime}ms (Backend: ${response.internal_time_ms}ms)`);

            // response.data est l'objet paginator
            setSubscriptions(response.data.data || []);
        } catch (error) {
            console.error("Error loading subscriptions", error);
            toast.error("Erreur lors du chargement des abonnements");
        } finally {
            setLoading(false);
        }
    };

    const handleAssociate = (sub: Subscription) => {
        setSelectedSub(sub);
        setRfidInput(sub.rfid_card_id || '');
        setShowAssociateModal(true);
    };

    const submitAssociation = async () => {
        if (!selectedSub || !rfidInput) return;

        try {
            await apiService.associateRfid(selectedSub.id, rfidInput);
            toast.success("Badge RFID associé avec succès");
            setShowAssociateModal(false);
            loadSubscriptions();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Erreur d'association");
        }
    };

    const handleDeliver = async (sub: Subscription) => {
        if (!window.confirm(`Confirmer la remise physique du badge à ${sub.user.name} ?`)) return;
        try {
            await apiService.deliverSubscription(sub.id);
            toast.success("Badge marqué comme livré");
            loadSubscriptions();
        } catch (error) {
            toast.error("Erreur lors de la remise du badge");
        }
    };

    const toggleStatus = async (sub: Subscription) => {
        const newStatus = sub.status === 'active' ? 'blocked' : 'active';
        try {
            await apiService.updateSubscriptionStatus(sub.id, newStatus);
            toast.success(`Badge ${newStatus === 'active' ? 'réactivé' : 'bloqué'}`);
            loadSubscriptions();
        } catch (error) {
            toast.error("Erreur lors du changement de statut");
        }
    };

    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

    const SubscriptionTableView = ({ subs }: { subs: Subscription[] }) => (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-white/5 backdrop-blur-sm">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Utilisateur</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Plan</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">RFID</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Crédits/Solde</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Statut</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Livraison</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Expiration</th>
                        {canManage && <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-transparent">
                    {subs.map((sub) => (
                        <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-ocean-100 dark:bg-ocean-900/30 flex items-center justify-center">
                                        <UserIcon className="h-5 w-5 text-ocean-600 dark:text-ocean-400" />
                                    </div>
                                    <div className="ml-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{sub.user.name}</div>
                                        <div className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{sub.user.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm font-bold text-gray-900 dark:text-white">
                                {sub.plan?.name || 'Plan Inconnu'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm font-mono text-gray-500 dark:text-gray-400">
                                {sub.rfid_card_id || <span className="text-gray-400 italic">Non associé</span>}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-white font-medium">
                                {sub.plan?.credit_type === 'unlimited' ? 'ILLIMITÉ' :
                                    sub.plan?.credit_type === 'voyages' ? `${sub.voyage_credits_remaining} tjts` :
                                        `${Number(sub.legacy_credit_fcfa).toLocaleString()} FCFA`}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sub.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                    sub.status === 'blocked' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}`}>
                                    {sub.status === 'active' ? 'Actif' : sub.status === 'blocked' ? 'Bloqué' : 'Expiré'}
                                </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                {sub.is_delivered ? (
                                    <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-bold text-xs bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded">
                                        <CheckCircleIcon className="w-3 h-3" /> Livré
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400 font-bold text-xs bg-orange-50 dark:bg-orange-500/10 px-2 py-1 rounded">
                                        <ClockIcon className="w-3 h-3" /> À remettre
                                    </span>
                                )}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                {new Date(sub.end_date).toLocaleDateString()}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => handleAssociate(sub)} className="text-ocean-600 dark:text-ocean-400 hover:text-ocean-900 dark:hover:text-ocean-300 transition-colors bg-ocean-50 dark:bg-ocean-900/20 p-2 rounded-lg" title="Associer RFID">
                                        <IdentificationIcon className="w-4 h-4" />
                                    </button>
                                    {!sub.is_delivered && (
                                        <button onClick={() => handleDeliver(sub)} className="text-orange-600 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300 transition-colors bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg" title="Marquer comme livré">
                                            <LifebuoyIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button onClick={() => toggleStatus(sub)} className={`transition-colors p-2 rounded-lg ${sub.status === 'active' ? 'text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20' : 'text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 bg-green-50 dark:bg-green-900/20'}`} title={sub.status === 'active' ? 'Bloquer' : 'Activer'}>
                                        {sub.status === 'active' ? <XCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Gestion des Badges</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gérez les abonnements et associez les cartes RFID physiques.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-200 dark:border-white/5 shadow-xl backdrop-blur-sm items-center">
                <div className="relative md:col-span-1">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="w-full bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-4 focus:ring-ocean-500/10 focus:border-ocean-500 transition-all font-medium text-sm text-gray-900 dark:text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="md:col-span-1">
                    <select
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-none rounded-2xl py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-ocean-500 font-medium"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="active">Actifs</option>
                        <option value="blocked">Bloqués</option>
                        <option value="expired">Expirés</option>
                    </select>
                </div>
                <div className="md:col-span-2 flex justify-end">
                    <div className="flex items-center bg-gray-100 dark:bg-gray-900/50 rounded-2xl p-1 border border-gray-200 dark:border-white/5 box-content">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-ocean-500 text-white shadow-lg shadow-ocean-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            title="Vue Liste"
                        >
                            <TableCellsIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-ocean-500 text-white shadow-lg shadow-ocean-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            title="Vue Carte"
                        >
                            <Squares2X2Icon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* List */}
            {viewMode === 'list' ? (
                <SubscriptionTableView subs={subscriptions} />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {loading ? (
                        Array(4).fill(0).map((_, i) => (
                            <div key={i} className="h-64 bg-gray-800/30 animate-pulse rounded-[2.5rem]"></div>
                        ))
                    ) : subscriptions.length === 0 ? (
                        <div className="lg:col-span-2 text-center py-20 bg-gray-800/20 rounded-[2.5rem] border border-dashed border-white/10">
                            <CreditCardIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 font-bold">Aucun abonnement trouvé.</p>
                        </div>
                    ) : (
                        subscriptions.map((sub) => (
                            <div key={sub.id} className="group bg-white dark:bg-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800/60 rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-xl transition-all hover:scale-[1.01]">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-2xl ${sub.status === 'active' ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                                            <CreditCardIcon className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{sub.plan.name}</p>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{sub.user.name}</h3>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${sub.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                                            sub.status === 'blocked' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400'
                                            }`}>
                                            {sub.status}
                                        </span>
                                        {sub.is_delivered ? (
                                            <span className="text-[9px] font-bold text-green-500 uppercase mt-2">Badge Livré</span>
                                        ) : (
                                            <span className="text-[9px] font-bold text-orange-500 uppercase mt-2">À remettre</span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/5">
                                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Solde</p>
                                        <p className="text-lg font-black text-ocean-600 dark:text-ocean-400 truncate">
                                            {sub.plan.credit_type === 'unlimited' ? 'ILLIMITÉ' :
                                                sub.plan.credit_type === 'voyages' ? `${sub.voyage_credits_remaining} tjts` :
                                                    `${Number(sub.legacy_credit_fcfa).toLocaleString()} FCFA`}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/5">
                                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">UID RFID</p>
                                        <p className="text-sm font-mono font-bold text-gray-600 dark:text-white/80 truncate">
                                            {sub.rfid_card_id || '---'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5">
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <CalendarIcon className="w-4 h-4" />
                                            Exp: {new Date(sub.end_date).toLocaleDateString()}
                                        </div>
                                    </div>
                                    {canManage && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAssociate(sub)}
                                                className="px-4 py-2 bg-ocean-600 hover:bg-ocean-500 text-white rounded-xl text-xs font-black transition shadow-lg shadow-ocean-600/20 flex items-center gap-2"
                                            >
                                                <IdentificationIcon className="w-4 h-4" />
                                                Associer
                                            </button>
                                            {!sub.is_delivered && (
                                                <button
                                                    onClick={() => handleDeliver(sub)}
                                                    className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-xs font-black transition shadow-lg shadow-orange-500/20 flex items-center gap-2"
                                                >
                                                    <LifebuoyIcon className="w-4 h-4" />
                                                    Remettre
                                                </button>
                                            )}
                                            <button
                                                onClick={() => toggleStatus(sub)}
                                                className={`p-2 rounded-xl transition ${sub.status === 'active' ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                                    }`}
                                            >
                                                {sub.status === 'active' ? <XCircleIcon className="w-6 h-6" /> : <CheckCircleIcon className="w-6 h-6" />}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal Association RFID */}
            {showAssociaterModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={() => setShowAssociateModal(false)}></div>
                    <div className="relative bg-gray-800 rounded-[3rem] p-10 w-full max-w-lg shadow-2xl border border-white/10">
                        <h2 className="text-2xl font-black text-white mb-6">Associer une Carte Physique</h2>
                        <p className="text-gray-400 mb-8">Scannez le badge RFID avec votre lecteur ou saisissez manuellement le code UID de la carte pour <strong>{selectedSub?.user.name}</strong>.</p>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Code UID RFID</label>
                                <div className="relative">
                                    <CreditCardIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-600" />
                                    <input
                                        autoFocus
                                        type="text"
                                        className="w-full bg-gray-900 border-none rounded-2xl py-4 pl-14 text-white text-xl font-mono focus:ring-2 focus:ring-ocean-500"
                                        placeholder="Ex: DF45A2B..."
                                        value={rfidInput}
                                        onChange={(e) => setRfidInput(e.target.value)}
                                    />
                                </div>
                                <p className="mt-4 text-[10px] text-gray-500 font-medium">Ce code remplacera le code de gestion interne généré automatiquement.</p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setShowAssociateModal(false)}
                                    className="flex-1 py-4 bg-gray-700 hover:bg-gray-600 text-white font-black rounded-2xl transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={submitAssociation}
                                    className="flex-1 py-4 bg-ocean-600 hover:bg-ocean-500 text-white font-black rounded-2xl shadow-xl shadow-ocean-600/20 transition"
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
