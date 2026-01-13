import { useState, useEffect } from 'react';
import { apiService, type Port } from '../../../services/api';
import { toast } from 'react-hot-toast';
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline';

interface RouteFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editingRoute?: any;
}

export default function RouteForm({ isOpen, onClose, onSuccess, editingRoute }: RouteFormProps) {
    const [ports, setPorts] = useState<Port[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        departure_port_id: '',
        arrival_port_id: '',
        duration_minutes: 60,
        is_active: true,
        create_return: false
    });

    useEffect(() => {
        if (isOpen) {
            loadPorts();
            if (editingRoute) {
                setFormData({
                    departure_port_id: editingRoute.departure_port_id || editingRoute.departure_port?.id,
                    arrival_port_id: editingRoute.arrival_port_id || editingRoute.arrival_port?.id,
                    duration_minutes: editingRoute.duration_minutes,
                    is_active: editingRoute.is_active ?? true,
                    create_return: false
                });
            } else {
                setFormData({
                    departure_port_id: '',
                    arrival_port_id: '',
                    duration_minutes: 60,
                    is_active: true,
                    create_return: false
                });
            }
        }
    }, [isOpen, editingRoute]);

    const loadPorts = async () => {
        try {
            const data = await apiService.getPorts();
            console.log('RouteForm - Ports loaded:', data);
            setPorts(data);
        } catch (error) {
            toast.error("Erreur lors du chargement des ports");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingRoute) {
                await apiService.updateRoute(editingRoute.id, formData);
            } else {
                await apiService.createRoute(formData);
            }
            onSuccess();
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-scaleIn">
                <div className="p-8 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                        {editingRoute ? 'Modifier la ligne' : 'Nouvelle ligne de navigation'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Configurez une liaison entre deux gares.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Gare de Départ</label>
                            <select
                                value={formData.departure_port_id}
                                onChange={e => setFormData({ ...formData, departure_port_id: e.target.value })}
                                required
                                className="w-full bg-gray-50 dark:bg-gray-700/50 border-0 rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-ocean-500 transition-all font-bold"
                            >
                                <option value="">Choisir...</option>
                                {ports.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Gare d'Arrivée</label>
                            <select
                                value={formData.arrival_port_id}
                                onChange={e => setFormData({ ...formData, arrival_port_id: e.target.value })}
                                required
                                className="w-full bg-gray-50 dark:bg-gray-700/50 border-0 rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-ocean-500 transition-all font-bold"
                            >
                                <option value="">Choisir...</option>
                                {ports.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Durée estimée (minutes)</label>
                        <input
                            type="number"
                            value={formData.duration_minutes}
                            onChange={e => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                            required
                            min="1"
                            className="w-full bg-gray-50 dark:bg-gray-700/50 border-0 rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-ocean-500 transition-all font-bold"
                        />
                    </div>

                    <div className="space-y-3">
                        {!editingRoute && (
                            <div className="flex items-center gap-3 p-4 bg-teal-50 dark:bg-teal-900/10 rounded-2xl border border-teal-100 dark:border-teal-900/30">
                                <input
                                    type="checkbox"
                                    id="create_return"
                                    checked={formData.create_return}
                                    onChange={e => setFormData({ ...formData, create_return: e.target.checked })}
                                    className="w-5 h-5 rounded-lg text-teal-600 focus:ring-teal-500 border-gray-300 transition-all cursor-pointer"
                                />
                                <div className="flex-1">
                                    <label htmlFor="create_return" className="text-sm font-black text-teal-900 dark:text-teal-200 cursor-pointer flex items-center gap-2">
                                        <ArrowsRightLeftIcon className="w-4 h-4" />
                                        Créer aussi le trajet retour
                                    </label>
                                    <p className="text-[10px] text-teal-700 dark:text-teal-400 font-bold">Génère automatiquement la ligne dans le sens inverse.</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3 p-4 bg-ocean-50 dark:bg-ocean-900/20 rounded-2xl border border-ocean-100 dark:border-ocean-900/30">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                className="w-5 h-5 rounded-lg text-ocean-600 focus:ring-ocean-500 border-gray-300 transition-all cursor-pointer"
                            />
                            <label htmlFor="is_active" className="text-sm font-bold text-ocean-900 dark:text-ocean-200 cursor-pointer">
                                Cette ligne est actuellement en service
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-8 py-4 bg-gray-50 dark:bg-gray-700 text-gray-400 font-bold rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-8 py-4 bg-gradient-to-r from-ocean-600 to-ocean-700 text-white font-black rounded-2xl shadow-xl shadow-ocean-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
