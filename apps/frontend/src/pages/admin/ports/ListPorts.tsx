import { useState, useEffect, useMemo } from 'react';
import { apiService, type Port } from '../../../services/api';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    MapPinIcon,
    MagnifyingGlassIcon,
    TableCellsIcon,
    Squares2X2Icon,
    ArrowDownTrayIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import PortForm from './PortForm';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export default function ListPorts() {
    const { user } = useAuth();
    const [ports, setPorts] = useState<Port[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPort, setEditingPort] = useState<Port | null>(null);

    // UI States
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = viewMode === 'grid' ? 6 : 10;

    useEffect(() => {
        loadPorts();
    }, []);

    const loadPorts = async () => {
        try {
            const data = await apiService.getPorts();
            const responseData = data as any;
            const portsList = Array.isArray(responseData) ? responseData : (responseData.data || []);
            setPorts(portsList);
        } catch (error) {
            console.error("Failed to load ports", error);
            toast.error("Impossible de charger les gares.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingPort(null);
        setIsModalOpen(true);
    };

    const handleEdit = (port: Port) => {
        setEditingPort(port);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce port ?')) {
            try {
                await apiService.deletePort(id);
                toast.success("Gare supprimée avec succès");
                loadPorts();
            } catch (error) {
                console.error("Failed to delete port", error);
                toast.error("Erreur lors de la suppression.");
            }
        }
    };

    const handleFormSuccess = () => {
        setIsModalOpen(false);
        loadPorts();
        toast.success(editingPort ? "Gare modifiée avec succès" : "Gare créée avec succès");
    };

    const handleExport = () => {
        const headers = ['ID', 'Nom', 'Code', 'Ville', 'Pays'];
        const csvContent = [
            headers.join(','),
            ...ports.map(p => [p.id, `"${p.name}"`, p.code, `"${p.city}"`, `"${p.country}"`].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `gares_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        toast.success("Exportation réussie !");
    };

    // Filtering and Pagination
    const filteredPorts = useMemo(() => {
        return ports.filter(port =>
            port.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            port.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            port.city.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [ports, searchQuery]);

    const paginatedPorts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredPorts.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredPorts, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredPorts.length / itemsPerPage);

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
                        Gares Maritimes
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Gérez les points d'embarquement et de débarquement.
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
                            Nouvelle Gare
                        </button>
                    )}
                </div>
            </div>

            {/* Controls Bar */}
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">
                {/* Search */}
                <div className="relative w-full sm:w-80">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher une gare..."
                        className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl py-2.5 pl-12 pr-4 outline-none focus:ring-4 focus:ring-ocean-500/10 focus:border-ocean-500 transition-all font-medium text-sm text-gray-900 dark:text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* View Toggles */}
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

            {/* Content Area */}
            {viewMode === 'list' ? (
                /* LIST VIEW */
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-white/5 backdrop-blur-sm">
                    <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Gare</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Code</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Localisation</th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-transparent">
                            {paginatedPorts.map((port) => (
                                <tr key={port.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-ocean-100 dark:bg-ocean-900/30 flex items-center justify-center">
                                                <span className="text-lg">⚓️</span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="font-medium text-gray-900 dark:text-white">{port.name}</div>
                                                <div className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">ID: #{port.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4">
                                        <span className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-700 px-2.5 py-1 text-xs font-bold text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-500/10 tracking-wider">
                                            {port.code}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-1.5">
                                            <MapPinIcon className="w-4 h-4 text-gray-400" />
                                            <span>{port.city}, {port.country}</span>
                                        </div>
                                    </td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                        {(user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager') && (
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => handleEdit(port)}
                                                    className="text-ocean-600 dark:text-ocean-400 hover:text-ocean-900 dark:hover:text-ocean-300 transition-colors bg-ocean-50 dark:bg-ocean-900/20 p-2 rounded-lg"
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(port.id)}
                                                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors bg-red-50 dark:bg-red-900/20 p-2 rounded-lg"
                                                >
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
                /* GRID VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedPorts.map((port) => (
                        <div key={port.id} className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-gray-200 dark:border-white/5 shadow-lg hover:shadow-xl hover:border-ocean-500/30 dark:hover:border-ocean-400/30 transition-all duration-300">
                            {/* Decorative gradient blob */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-ocean-500/10 rounded-full blur-[50px] group-hover:bg-ocean-500/20 transition-all duration-500 pointer-events-none"></div>

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-ocean-500 to-teal-500 flex items-center justify-center text-2xl shadow-lg shadow-ocean-500/20">
                                    ⚓️
                                </div>
                                <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700/50 px-3 py-1 text-xs font-bold text-gray-600 dark:text-gray-300 ring-1 ring-inset ring-gray-500/10">
                                    {port.code}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-ocean-500 transition-colors">
                                {port.name}
                            </h3>

                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                                <MapPinIcon className="w-4 h-4" />
                                {port.city}, {port.country}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50">
                                <span className="text-xs text-gray-400 font-mono">ID: {port.id}</span>
                                {(user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager') && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(port)}
                                            className="p-2 text-gray-500 hover:text-ocean-600 hover:bg-ocean-50 dark:hover:bg-ocean-900/30 rounded-lg transition-colors"
                                            title="Modifier"
                                        >
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(port.id)}
                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                            title="Supprimer"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredPorts.length === 0 && (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        <MagnifyingGlassIcon />
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">Aucune gare trouvée</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Essayez de modifier votre recherche ou ajoutez une nouvelle gare.
                    </p>
                </div>
            )}

            {/* Pagination Controls */}
            {filteredPorts.length > 0 && (
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
                                Affichage de <span className="font-medium">{Math.min(filteredPorts.length, (currentPage - 1) * itemsPerPage + 1)}</span> à <span className="font-medium">{Math.min(filteredPorts.length, currentPage * itemsPerPage)}</span> sur <span className="font-medium">{filteredPorts.length}</span> résultats
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                    <span className="sr-only">Précédent</span>
                                    <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                                </button>
                                {[...Array(totalPages)].map((_, idx) => (
                                    <button
                                        key={idx + 1}
                                        onClick={() => setCurrentPage(idx + 1)}
                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${currentPage === idx + 1
                                            ? 'z-10 bg-ocean-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-600'
                                            : 'text-gray-900 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                    <span className="sr-only">Suivant</span>
                                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Simple Modal for Create/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200 dark:border-gray-700">
                            <PortForm
                                port={editingPort}
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
