import { useState, useEffect, useMemo } from 'react';
import { apiService, type Ship } from '../../../services/api';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    TableCellsIcon,
    Squares2X2Icon,
    ArrowDownTrayIcon,
    LifebuoyIcon
} from '@heroicons/react/24/outline';
import ShipForm from './ShipForm';
import ShipDetails from './ShipDetails';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export default function ListShips() {
    const { user } = useAuth();
    const [ships, setShips] = useState<Ship[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShip, setEditingShip] = useState<Ship | null>(null);
    const [viewingShip, setViewingShip] = useState<Ship | null>(null);

    // UI States
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = viewMode === 'grid' ? 6 : 10;

    useEffect(() => {
        loadShips();
    }, []);

    const loadShips = async () => {
        const start = performance.now();
        try {
            const data = await apiService.getShips();
            const totalTime = Math.round(performance.now() - start);
            console.log(`🚢 [Ships] Chargé en ${totalTime}ms (Backend: ${data.internal_time_ms}ms)`);
            setShips(data.data || []);
        } catch (error) {
            console.error("Failed to load ships", error);
            toast.error("Impossible de charger les navires.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingShip(null);
        setIsModalOpen(true);
    };

    const handleEdit = (ship: Ship) => {
        setEditingShip(ship);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce navire ?')) {
            try {
                await apiService.deleteShip(id);
                toast.success("Navire supprimé avec succès");
                loadShips();
            } catch (error) {
                console.error("Failed to delete ship", error);
                toast.error("Erreur lors de la suppression (il est peut-être lié à des voyages).");
            }
        }
    };

    const handleFormSuccess = () => {
        setIsModalOpen(false);
        loadShips();
        toast.success(editingShip ? "Navire modifié avec succès" : "Navire créé avec succès");
    };

    const handleExport = () => {
        const headers = ['ID', 'Nom', 'Compagnie', 'Type', 'Capacité Pax'];
        const csvContent = [
            headers.join(','),
            ...ships.map(s => [s.id, `"${s.name}"`, `"${s.company}"`, s.type, s.capacity_pax].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `navires_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        toast.success("Exportation réussie !");
    };

    // Filtering and Pagination
    const filteredShips = useMemo(() => {
        return ships.filter(ship =>
            ship.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ship.company.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [ships, searchQuery]);

    const paginatedShips = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredShips.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredShips, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredShips.length / itemsPerPage);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                        Gestion des Navires
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Configurez la flotte de bateaux disponibles.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Exporter
                    </button>
                    {(user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager') && (
                        <button
                            onClick={handleCreate}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-ocean-600 rounded-lg hover:bg-ocean-500 shadow-lg shadow-ocean-500/30 transition"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Nouveau Navire
                        </button>
                    )}
                </div>
            </div>

            {/* Controls Bar */}
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">
                <div className="relative w-full sm:w-80">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un navire..."
                        className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl py-2.5 pl-12 pr-4 outline-none focus:ring-4 focus:ring-ocean-500/10 focus:border-ocean-500 transition-all font-medium text-sm text-gray-900 dark:text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center bg-gray-100 dark:bg-gray-700/50 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm text-ocean-600 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                    >
                        <TableCellsIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm text-ocean-600 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                    >
                        <Squares2X2Icon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {viewMode === 'list' ? (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-white/5 backdrop-blur-sm">
                    <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Navire</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Compagnie</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Capacités</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Statut</th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-transparent">
                            {paginatedShips.map((ship) => (
                                <tr key={ship.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                                        <div className="flex items-center">
                                            {ship.images && ship.images.length > 0 ? (
                                                <img
                                                    src={ship.images[0].startsWith('http') ? ship.images[0] : `${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${ship.images[0]}`}
                                                    alt={ship.name}
                                                    className="h-10 w-10 rounded-lg object-cover cursor-pointer hover:opacity-80 transition"
                                                    onClick={() => setViewingShip(ship)}
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Navire';
                                                    }}
                                                />
                                            ) : (
                                                <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                                    <LifebuoyIcon className="h-6 w-6 text-indigo-600" />
                                                </div>
                                            )}
                                            <div className="ml-4">
                                                <div
                                                    className="font-medium text-gray-900 dark:text-white cursor-pointer hover:text-ocean-600 dark:hover:text-ocean-400 transition"
                                                    onClick={() => setViewingShip(ship)}
                                                >
                                                    {ship.name}
                                                </div>
                                                <div className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{ship.type}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{ship.company}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col gap-1">
                                            <span>PASS: {ship.capacity_pax}</span>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ship.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                            {ship.is_active ? 'Actif' : 'Maintenance'}
                                        </span>
                                    </td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                        {(user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager') && (
                                            <div className="flex justify-end gap-3">
                                                <button onClick={() => handleEdit(ship)} className="text-ocean-600 dark:text-ocean-400 hover:text-ocean-900 dark:hover:text-ocean-300 transition-colors bg-ocean-50 dark:bg-ocean-900/20 p-2 rounded-lg">
                                                    <PencilIcon className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(ship.id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedShips.map((ship) => (
                        <div key={ship.id} className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-gray-200 dark:border-white/5 shadow-lg hover:shadow-xl hover:border-ocean-500/30 dark:hover:border-ocean-400/30 transition-all duration-300">
                            {/* Decorative Blob */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-[50px] group-hover:bg-indigo-500/20 transition-all duration-500 pointer-events-none"></div>

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                {ship.images && ship.images.length > 0 ? (
                                    <img
                                        src={ship.images[0].startsWith('http') ? ship.images[0] : `${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${ship.images[0]}`}
                                        alt={ship.name}
                                        className="h-16 w-16 rounded-xl object-cover shadow-md cursor-pointer hover:opacity-80 transition"
                                        onClick={() => setViewingShip(ship)}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Navire';
                                        }}
                                    />
                                ) : (
                                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                        <LifebuoyIcon className="w-8 h-8" />
                                    </div>
                                )}
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ship.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                    {ship.is_active ? 'Actif' : 'Maint.'}
                                </span>
                            </div>

                            <h3
                                className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-ocean-500 transition-colors cursor-pointer"
                                onClick={() => setViewingShip(ship)}
                            >
                                {ship.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{ship.company}</p>

                            <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-gray-700/30 p-2 rounded-lg text-center">
                                <div>
                                    <span className="block text-xs text-gray-400 uppercase tracking-widest font-black">Capacité Passagers</span>
                                    <span className="font-bold text-lg">{ship.capacity_pax}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50">
                                <span className="text-xs text-gray-400 font-mono">{ship.type}</span>
                                {(user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager') && (
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(ship)} className="p-2 text-gray-500 hover:text-ocean-600 hover:bg-ocean-50 dark:hover:bg-ocean-900/30 rounded-lg transition-colors">
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(ship.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 dark:border-white/5 px-4 py-3 sm:px-6">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Précédent
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Suivant
                        </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700 dark:text-gray-400">
                                Affichage de <span className="font-medium">{Math.min(filteredShips.length, (currentPage - 1) * itemsPerPage + 1)}</span> à <span className="font-medium">{Math.min(filteredShips.length, currentPage * itemsPerPage)}</span> sur <span className="font-medium">{filteredShips.length}</span> résultats
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/10 rounded-xl text-xs font-black text-gray-700 dark:text-white disabled:opacity-30 transition hover:bg-ocean-500 hover:text-white"
                            >
                                Précédent
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/10 rounded-xl text-xs font-black text-gray-700 dark:text-white disabled:opacity-30 transition hover:bg-ocean-500 hover:text-white"
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-200 dark:border-gray-700">
                            <ShipForm
                                ship={editingShip}
                                onSuccess={handleFormSuccess}
                                onCancel={() => setIsModalOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}

            <ShipDetails
                ship={viewingShip}
                open={!!viewingShip}
                onClose={() => setViewingShip(null)}
            />
        </div>
    );
}
