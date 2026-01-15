import { useState, useEffect, useMemo } from 'react';
import { apiService, type Route } from '../../../services/api';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    MapIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    TableCellsIcon,
    Squares2X2Icon
} from '@heroicons/react/24/outline';
import RouteForm from './RouteForm';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export default function ListRoutes() {
    const { user } = useAuth();
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

    useEffect(() => {
        loadRoutes();
    }, []);

    const loadRoutes = async () => {
        try {
            const data = await apiService.getAdminRoutes();
            setRoutes(data.data || []);
        } catch (error) {
            console.error("Failed to load routes", error);
            toast.error("Impossible de charger les lignes de navigation.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingRoute(null);
        setIsModalOpen(true);
    };

    const handleEdit = (route: Route) => {
        setEditingRoute(route);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette ligne ?')) {
            try {
                await apiService.deleteRoute(id);
                toast.success("Ligne supprimée");
                loadRoutes();
            } catch (error) {
                toast.error("Erreur lors de la suppression.");
            }
        }
    };

    const filteredRoutes = useMemo(() => {
        return routes.filter(route =>
            route.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            route.departure_port?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            route.arrival_port?.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [routes, searchQuery]);

    return (
        <div className="space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Lignes de Navigation</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Gérez le réseau maritime (Liaisons entre gares).</p>
                </div>
                {(user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager') && (
                    <button
                        onClick={handleCreate}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-ocean-600 to-ocean-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-ocean-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <PlusIcon className="w-5 h-5 stroke-[3]" />
                        <span>Nouvelle Ligne</span>
                    </button>
                )}
            </div>

            {/* Filters and Actions */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-ocean-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Rechercher une ligne..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-4 focus:ring-ocean-500/10 focus:border-ocean-500 transition-all font-medium text-gray-900 dark:text-white shadow-sm"
                    />
                </div>

                <div className="flex gap-2">
                    <div className="bg-white dark:bg-gray-800 p-1 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-ocean-500 text-white shadow-lg shadow-ocean-500/30' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                        >
                            <Squares2X2Icon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-ocean-500 text-white shadow-lg shadow-ocean-500/30' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                        >
                            <TableCellsIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <button
                        onClick={loadRoutes}
                        className="p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-gray-400 hover:text-ocean-500 transition-all shadow-sm group"
                    >
                        <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin text-ocean-500' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    </button>
                </div>
            </div>

            {/* Content Section */}
            {loading && routes.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array(6).fill(0).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 h-48 rounded-[2.5rem] animate-pulse border border-gray-50 dark:border-gray-700"></div>
                    ))}
                </div>
            ) : filteredRoutes.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                        {filteredRoutes.map((route) => (
                            <div key={route.id} className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl group transition-all relative overflow-hidden">
                                {/* Accent line */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-ocean-500 to-teal-400 opacity-50"></div>

                                <div className="flex items-center justify-between mb-8">
                                    <div className="p-4 rounded-2xl bg-ocean-50 dark:bg-ocean-900/20 text-ocean-600 dark:text-ocean-400 group-hover:scale-110 transition-transform duration-500">
                                        <MapIcon className="w-6 h-6 stroke-[2]" />
                                    </div>
                                    {(user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager') && (
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(route)} className="p-2 text-gray-400 hover:text-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/30 rounded-lg transition-all">
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDelete(route.id as any)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-2 h-2 rounded-full bg-ocean-500"></div>
                                            <div className="w-0.5 h-8 bg-dashed border-l-2 border-dashed border-gray-200 dark:border-gray-700"></div>
                                            <div className="w-2 h-2 rounded-full border-2 border-ocean-500"></div>
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Départ</p>
                                                <p className="font-black text-gray-900 dark:text-white truncate">{route.departure_port?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Arrivée</p>
                                                <p className="font-black text-gray-900 dark:text-white truncate">{route.arrival_port?.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ArrowPathIcon className="w-4 h-4 text-gray-400" />
                                        <span className="text-xs font-bold text-gray-500">{route.duration_minutes} min</span>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${(route as any).is_active
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-gray-100 text-gray-500 dark:bg-gray-700'
                                        }`}>
                                        {(route as any).is_active ? 'Active' : 'Inactif'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden animate-fadeIn">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/50">
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Départ</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Arrivée</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Durée</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Status</th>
                                    {(user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager') && (
                                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                {filteredRoutes.map((route) => (
                                    <tr key={route.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors group">
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                            {route.departure_port?.name}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                            {route.arrival_port?.name}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400">
                                            {route.duration_minutes} min
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${(route as any).is_active
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                                                : 'bg-gray-100 text-gray-400 dark:bg-gray-700'
                                                }`}>
                                                {(route as any).is_active ? 'Active' : 'Inactif'}
                                            </span>
                                        </td>
                                        {(user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager') && (
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEdit(route)} className="p-2 text-gray-400 hover:text-ocean-500 transition-all">
                                                        <PencilIcon className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => handleDelete(route.id as any)} className="p-2 text-gray-400 hover:text-red-500 transition-all">
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-16 text-center border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-ocean-500/5 rounded-full blur-[100px]"></div>
                    <MapIcon className="w-24 h-24 mx-auto text-gray-200 dark:text-gray-700 mb-6" />
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Aucune ligne trouvée</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm mx-auto mb-8">
                        {searchQuery ? "Aucun résultat ne correspond à votre recherche." : "Commencez par créer une ligne de navigation pour relier deux gares."}
                    </p>
                    <button
                        onClick={handleCreate}
                        className="bg-ocean-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-ocean-700 transition-all shadow-xl shadow-ocean-500/20"
                    >
                        Créer une ligne maintenant
                    </button>
                </div>
            )}

            <RouteForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    loadRoutes();
                    toast.success(editingRoute ? "Ligne modifiée" : "Ligne créée");
                }}
                editingRoute={editingRoute}
            />
        </div>
    );
}
