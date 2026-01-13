import { useState, useEffect, useMemo } from 'react';
import { apiService } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import type { CashDesk, Port, User } from '../../../services/api';
import {
    BuildingStorefrontIcon,
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    UserMinusIcon,
    TableCellsIcon,
    Squares2X2Icon,
    ArrowPathIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function ListCashDesks() {
    const { user } = useAuth();
    const [cashDesks, setCashDesks] = useState<CashDesk[]>([]);
    const [ports, setPorts] = useState<Port[]>([]);
    const [agents, setAgents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showModal, setShowModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedDesk, setSelectedDesk] = useState<CashDesk | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        port_id: '',
        is_active: true
    });

    const [assignData, setAssignData] = useState({
        user_id: ''
    });

    useEffect(() => {
        // Chargement initial des données. 
        // On évite de vider le cache à chaque fois pour gagner en rapidité.
        loadCommonResources();
        loadCashDesks();
    }, []);

    const loadCommonResources = async () => {
        try {
            // Chargement des ports et des agents en parallèle
            const [portsRes, usersRes] = await Promise.all([
                apiService.getPorts(),
                apiService.getAdminUsers({ role: 'guichetier' })
            ]);
            setPorts(portsRes);
            // Extraction des données agents (gestion des différents formats de réponse)
            const agentsData = usersRes.data || usersRes || [];
            setAgents(Array.isArray(agentsData) ? agentsData : (agentsData.data || []));
        } catch (error) {
            console.error('Erreur lors du chargement des ressources:', error);
        }
    };

    const loadCashDesks = async () => {
        setLoading(true);
        try {
            // Récupération de tous les guichets. On utilise le filtrage local pour une recherche instantanée.
            const desksRes = await apiService.getCashDesks();
            setCashDesks(Array.isArray(desksRes) ? desksRes : []);
        } catch (error: any) {
            console.error('Erreur lors du chargement des guichets:', error);
            toast.error("Erreur lors du chargement des guichets");
        } finally {
            setLoading(false);
        }
    };

    const loadData = async () => {
        await Promise.all([loadCommonResources(), loadCashDesks()]);
    };

    // Client-side filtering for instant results
    const filteredDesks = useMemo(() => {
        if (!searchQuery.trim()) return cashDesks;
        const query = searchQuery.toLowerCase();
        return cashDesks.filter(desk =>
            desk.name.toLowerCase().includes(query) ||
            desk.code.toLowerCase().includes(query) ||
            desk.port?.name.toLowerCase().includes(query)
        );
    }, [cashDesks, searchQuery]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (selectedDesk) {
                await apiService.updateCashDesk(selectedDesk.id, {
                    ...formData,
                    port_id: parseInt(formData.port_id)
                });
                toast.success("Guichet mis à jour");
            } else {
                await apiService.createCashDesk({
                    ...formData,
                    port_id: parseInt(formData.port_id)
                });
                toast.success("Guichet créé");
            }
            setShowModal(false);
            await loadCashDesks();
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Supprimer ce guichet ?")) return;
        try {
            await apiService.deleteCashDesk(id);
            toast.success("Guichet supprimé");
            loadData();
        } catch (error) {
            toast.error("Erreur lors de la suppression");
        }
    };

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDesk) return;
        if (!assignData.user_id) {
            toast.error("Veuillez sélectionner un agent");
            return;
        }

        setAssigning(true);
        try {
            await apiService.assignAgentToCashDesk(selectedDesk.id, assignData.user_id);
            toast.success("Agent assigné avec succès");
            setShowAssignModal(false);
            setAssignData({ user_id: '' });
            await loadCashDesks();
        } catch (error) {
            console.error('Erreur assignation:', error);
            toast.error("Erreur lors de l'assignation");
        } finally {
            setAssigning(false);
        }
    };

    const handleUnassign = async (userId: string | number) => {
        if (!confirm("Retirer cet agent du guichet ?")) return;
        try {
            await apiService.unassignAgentFromCashDesk(userId);
            toast.success("Agent retiré");
            await loadCashDesks();
        } catch (error) {
            toast.error("Erreur");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Gestion des Guichets</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">Points de vente et assignation des agents</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Zone de Recherche */}
                    <div className="relative group min-w-[300px]">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-ocean-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Rechercher un guichet, code ou port..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-4 focus:ring-ocean-500/10 focus:border-ocean-500 transition-all font-medium text-gray-900 dark:text-white shadow-sm"
                        />
                    </div>

                    <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-ocean-600 text-ocean-600 dark:text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                        >
                            <Squares2X2Icon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-ocean-600 text-ocean-600 dark:text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                        >
                            <TableCellsIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <button
                        onClick={() => loadData()}
                        className="p-3 text-gray-500 hover:text-ocean-600 transition-colors"
                        title="Actualiser"
                    >
                        <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    {(user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager') && (
                        <button
                            onClick={() => {
                                setSelectedDesk(null);
                                setFormData({ name: '', code: '', port_id: '', is_active: true });
                                setShowModal(true);
                            }}
                            className="bg-ocean-600 hover:bg-ocean-500 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-ocean-600/20 active:scale-95"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Nouveau Guichet
                        </button>
                    )}
                </div>
            </div>

            {loading && cashDesks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Chargement des guichets...</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDesks.map(desk => (
                        <div key={desk.id} className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-xl border border-gray-100 dark:border-white/5 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${desk.is_active ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600'}`}>
                                        <BuildingStorefrontIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase leading-tight">{desk.name}</h3>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{desk.code} • {desk.port?.name}</span>
                                    </div>
                                </div>
                                {(user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager') && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedDesk(desk);
                                                setFormData({
                                                    name: desk.name,
                                                    code: desk.code,
                                                    port_id: desk.port_id.toString(),
                                                    is_active: desk.is_active
                                                });
                                                setShowModal(true);
                                            }}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-400 transition-colors"
                                        >
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(desk.id)}
                                            className="p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-full text-rose-400 transition-colors"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-gray-50 dark:border-white/5">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[10px] font-black text-ocean-600 dark:text-ocean-400 uppercase tracking-widest">Agents Assignés</span>
                                    {(user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager') && (!desk.agents || desk.agents.length === 0) && (
                                        <button
                                            onClick={() => {
                                                setSelectedDesk(desk);
                                                setShowAssignModal(true);
                                            }}
                                            className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
                                        >
                                            + Assigner
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    {desk.agents && desk.agents.length > 0 ? (
                                        desk.agents.map(agent => (
                                            <div key={agent.id} className="flex justify-between items-center bg-gray-50 dark:bg-white/5 px-3 py-2 rounded-xl border border-gray-100 dark:border-white/5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-ocean-100 dark:bg-ocean-900 flex items-center justify-center text-[10px] font-bold text-ocean-600">
                                                        {agent.name.charAt(0)}
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{agent.name}</span>
                                                </div>
                                                {(user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager') && (
                                                    <button
                                                        onClick={() => handleUnassign(agent.id)}
                                                        className="text-gray-400 hover:text-rose-500 transition-colors"
                                                    >
                                                        <UserMinusIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-2 text-[10px] font-bold text-gray-400 uppercase italic">Aucun agent assigné</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-white/5">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Guichet</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Code</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Port</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Agents</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {filteredDesks.map(desk => (
                                <tr key={desk.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-bold text-sm text-gray-900 dark:text-white uppercase">{desk.name}</td>
                                    <td className="px-6 py-4 text-xs font-mono text-gray-500 uppercase">{desk.code}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-bold">{desk.port?.name}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex -space-x-2">
                                            {desk.agents?.map(agent => (
                                                <div key={agent.id} className="w-8 h-8 rounded-full bg-ocean-100 dark:bg-ocean-900 border-2 border-white dark:border-gray-800 flex items-center justify-center text-[10px] font-bold text-ocean-600" title={agent.name}>
                                                    {agent.name.charAt(0)}
                                                </div>
                                            ))}
                                            {(user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager') && (!desk.agents || desk.agents.length === 0) && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedDesk(desk);
                                                        setShowAssignModal(true);
                                                    }}
                                                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 border-2 border-white dark:border-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                                                >
                                                    +
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${desk.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {desk.is_active ? 'Actif' : 'Inactif'}
                                        </span>
                                    </td>
                                    {(user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager') && (
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedDesk(desk);
                                                    setFormData({
                                                        name: desk.name,
                                                        code: desk.code,
                                                        port_id: desk.port_id.toString(),
                                                        is_active: desk.is_active
                                                    });
                                                    setShowModal(true);
                                                }}
                                                className="p-2 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 text-ocean-600 rounded-lg transition-colors"
                                            >
                                                <PencilSquareIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(desk.id)}
                                                className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 rounded-lg transition-colors"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal CRUD */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-300">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-6">
                            {selectedDesk ? 'Modifier le Guichet' : 'Nouveau Guichet'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Nom du Guichet</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-white/5 rounded-2xl py-3 px-4 font-bold text-sm"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Code Unique</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-white/5 rounded-2xl py-3 px-4 font-bold text-sm"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Port / Gare</label>
                                <select
                                    required
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-white/5 rounded-2xl py-3 px-4 font-bold text-sm"
                                    value={formData.port_id}
                                    onChange={e => setFormData({ ...formData, port_id: e.target.value })}
                                >
                                    <option value="">Sélectionner un port</option>
                                    {ports.map(port => (
                                        <option key={port.id} value={port.id}>{port.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-3 py-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_active ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Guichet Actif</span>
                            </div>

                            <div className="flex gap-3 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-6 py-3 text-xs font-black text-gray-500 uppercase tracking-widest hover:text-gray-700 transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-ocean-600 hover:bg-ocean-500 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : null}
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Assignation */}
            {showAssignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-300">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">
                            Assigner un Agent
                        </h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Guichet: {selectedDesk?.name}</p>

                        <form onSubmit={handleAssign} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Sélectionner l'Agent</label>
                                <select
                                    required
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-white/5 rounded-2xl py-3 px-4 font-bold text-sm"
                                    value={assignData.user_id}
                                    onChange={e => setAssignData({ user_id: e.target.value })}
                                >
                                    <option value="">Sélectionner un guichetier</option>
                                    {agents.map(agent => (
                                        <option key={agent.id} value={agent.id}>{agent.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAssignModal(false)}
                                    className="flex-1 px-6 py-3 text-xs font-black text-gray-500 uppercase tracking-widest hover:text-gray-700 transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={assigning}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                                >
                                    {assigning ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : null}
                                    Confirmer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
