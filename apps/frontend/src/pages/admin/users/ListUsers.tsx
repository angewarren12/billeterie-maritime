import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../../services/api';
import {
    UsersIcon,
    MagnifyingGlassIcon,
    ChevronRightIcon,
    TicketIcon,
    CalendarIcon,
    ArrowPathIcon,
    IdentificationIcon,
    TableCellsIcon,
    Squares2X2Icon,
    UserPlusIcon,
    BriefcaseIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import UserForm from './UserForm';

interface UserSummary {
    id: string;
    name: string;
    email: string;
    phone: string;
    created_at: string;
    bookings_count: number;
    role: string;
    subscriptions: Array<{
        id: string;
        plan: {
            name: string;
        }
    }>;
}

export default function ListUsers() {
    const [users, setUsers] = useState<UserSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'clients' | 'staff'>('clients');
    const [role, setRole] = useState('all');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        loadUsers();
    }, [search, role, activeTab, page]);

    // Reset filters when changing tab
    useEffect(() => {
        setRole('all');
        setPage(1);
    }, [activeTab]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await apiService.getAdminUsers({
                search,
                role,
                type: activeTab,
                page
            });
            setUsers(response.data.data || []);
            setPagination(response.data);
            console.log(`👥 [Users] Chargé en ${response.internal_time_ms}ms (Backend)`);
        } catch (error) {
            console.error("Error loading users", error);
            toast.error("Échec du chargement de la liste");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-4">
                        <UsersIcon className="w-10 h-10 text-ocean-500" />
                        Base Utilisateurs
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Gérez vos passagers et votre personnel navigant ou administratif.</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-ocean-600 hover:bg-ocean-500 text-white px-8 py-4 rounded-3xl font-black flex items-center gap-3 transition-all shadow-xl shadow-ocean-600/20 active:scale-95 group"
                    >
                        <UserPlusIcon className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                        <span className="uppercase tracking-widest text-sm">Nouvel Utilisateur</span>
                    </button>
                    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm dark:shadow-none backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div>
                                <p className="text-[10px] font-black text-ocean-600 dark:text-ocean-400 uppercase tracking-widest mb-1">Inscrits</p>
                                <p className="text-3xl font-black text-gray-900 dark:text-white">{pagination?.total || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TABS SELECTOR */}
            <div className="flex gap-4 border-b border-gray-200 dark:border-white/5 pb-1">
                <button
                    onClick={() => setActiveTab('clients')}
                    className={`pb-4 px-8 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'clients' ? 'text-ocean-600 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <span className="flex items-center gap-2">
                        <UsersIcon className="w-5 h-5" />
                        Clients / Passagers
                    </span>
                    {activeTab === 'clients' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-ocean-500 rounded-t-full shadow-[0_-4px_10px_rgba(14,165,233,0.5)]"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('staff')}
                    className={`pb-4 px-8 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'staff' ? 'text-ocean-600 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <span className="flex items-center gap-2">
                        <BriefcaseIcon className="w-5 h-5" />
                        Personnel / Agents
                    </span>
                    {activeTab === 'staff' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-ocean-500 rounded-t-full shadow-[0_-4px_10px_rgba(14,165,233,0.5)]"></div>}
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-white/5 p-4 rounded-[2rem] shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group w-full">
                    <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-ocean-500 transition-colors" />
                    <input
                        type="text"
                        placeholder={`Rechercher un ${activeTab === 'clients' ? 'client' : 'membre du personnel'}...`}
                        className="w-full bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-white/10 rounded-2xl py-3.5 pl-14 pr-4 outline-none focus:ring-4 focus:ring-ocean-500/10 focus:border-ocean-500 transition-all font-medium text-sm text-gray-900 dark:text-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex gap-4 items-center w-full md:w-auto">
                    {activeTab === 'staff' && (
                        <select
                            className="bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-white/5 rounded-xl py-3.5 px-6 text-gray-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-ocean-500 transition-all font-bold text-xs"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="all">Tous les rôles</option>
                            <option value="agent_embarquement">Agents Embarquement</option>
                            <option value="guichetier">Guichetiers</option>
                            <option value="manager">Managers</option>
                            <option value="comptable">Comptables</option>
                            <option value="admin">Administrateurs</option>
                        </select>
                    )}

                    <div className="flex items-center bg-gray-50 dark:bg-gray-900/50 rounded-xl p-1 border border-gray-100 dark:border-white/5">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-ocean-500 text-ocean-600 dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`}
                        >
                            <TableCellsIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-ocean-500 text-ocean-600 dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`}
                        >
                            <Squares2X2Icon className="w-5 h-5" />
                        </button>
                    </div>

                    <button
                        onClick={() => loadUsers()}
                        className="p-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-gray-400 hover:text-ocean-600 transition-all"
                    >
                        <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin text-ocean-500' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Users Content */}
            {loading && users.length === 0 ? (
                <div className="py-20 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-ocean-500/20 border-t-ocean-500 rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Synchronisation...</p>
                </div>
            ) : users.length === 0 ? (
                <div className="py-32 text-center space-y-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-[3rem] border border-dashed border-gray-200 dark:border-white/5">
                    <UsersIcon className="w-16 h-16 text-gray-300 dark:text-gray-800 mx-auto" />
                    <p className="text-gray-400 font-black text-xl uppercase tracking-tighter">Aucun {activeTab === 'clients' ? 'client' : 'personnel'} trouvé</p>
                </div>
            ) : viewMode === 'list' ? (
                /* LIST VIEW */
                <div className="bg-white dark:bg-gray-800/30 rounded-[2.5rem] border border-gray-200 dark:border-white/5 overflow-hidden shadow-xl dark:shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Utilisateur</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Contact</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center">Statut / Rôle</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Membre depuis</th>
                                    <th className="px-8 py-5"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {users.map((user) => (
                                    <tr key={user.id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-ocean-50 dark:bg-ocean-500/10 flex items-center justify-center text-ocean-600 dark:text-ocean-400 font-black text-lg border border-ocean-100 dark:border-ocean-500/10">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-gray-900 dark:text-white font-black text-lg uppercase tracking-tight">{user.name}</p>
                                                    <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest">ID: {String(user.id).slice(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-gray-700 dark:text-white/80 font-bold mb-0.5">{user.email}</p>
                                            <p className="text-gray-400 dark:text-gray-500 text-xs font-medium">{user.phone || '-- -- -- --'}</p>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            {activeTab === 'clients' ? (
                                                user.subscriptions && user.subscriptions.length > 0 ? (
                                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl border border-green-200 dark:border-green-500/20">
                                                        <IdentificationIcon className="w-4 h-4" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{user.subscriptions[0].plan.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest italic">Passager Standard</span>
                                                )
                                            ) : (
                                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-ocean-50 dark:bg-ocean-500/10 text-ocean-600 dark:text-ocean-400 rounded-xl border border-ocean-200 dark:border-ocean-500/20 shadow-sm">
                                                    <BriefcaseIcon className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{user.role}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-gray-500 text-xs font-bold">
                                                <CalendarIcon className="w-4 h-4 opacity-40" />
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <Link
                                                to={`/admin/users/${user.id}`}
                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-50 hover:bg-ocean-600 dark:bg-white/5 dark:hover:bg-ocean-600 text-gray-600 hover:text-white dark:text-white rounded-xl text-xs font-black transition-all active:scale-95"
                                            >
                                                Profil
                                                <ChevronRightIcon className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* GRID VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map((user) => (
                        <div key={user.id} className="group relative bg-white dark:bg-gray-800/20 backdrop-blur-md rounded-[2.5rem] p-8 border border-gray-200 dark:border-white/5 hover:border-ocean-500/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-16 h-16 rounded-3xl bg-ocean-50 dark:bg-ocean-500/10 flex items-center justify-center text-ocean-600 dark:text-ocean-400 font-black text-2xl border border-ocean-100 dark:border-ocean-500/10 shadow-sm">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${activeTab === 'staff' ? 'bg-ocean-600 text-white shadow-lg shadow-ocean-600/20' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400'}`}>
                                        {user.role}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 group-hover:text-ocean-600 transition-colors uppercase tracking-tight leading-none">{user.name}</h3>
                                <p className="text-gray-400 font-bold text-sm truncate">{user.email}</p>
                                {user.phone && <p className="text-gray-500 dark:text-gray-500 text-xs mt-1 font-medium">{user.phone}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/10">
                                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Missions</p>
                                    <div className="flex items-center gap-2 text-gray-900 dark:text-white font-black text-lg">
                                        <TicketIcon className="w-5 h-5 text-ocean-500" />
                                        {user.bookings_count}
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/10">
                                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Ancienneté</p>
                                    <div className="flex items-center gap-2 text-gray-900 dark:text-white font-black">
                                        <CalendarIcon className="w-5 h-5 text-ocean-500" />
                                        <span className="text-sm">{new Date(user.created_at).getFullYear()}</span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                to={`/admin/users/${user.id}`}
                                className="w-full flex items-center justify-center gap-3 py-4 bg-gray-900 dark:bg-white hover:bg-ocean-600 dark:hover:bg-ocean-600 text-white dark:text-gray-900 hover:text-white dark:hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
                            >
                                Voir Profil Détail
                                <ChevronRightIcon className="w-4 h-4" />
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-3xl p-6 flex justify-between items-center shadow-lg">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Page {pagination.current_page} sur {pagination.last_page} • {pagination.total} inscrits
                    </p>
                    <div className="flex gap-3">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="px-6 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[10px] font-black text-gray-600 dark:text-white disabled:opacity-30 transition hover:bg-ocean-50"
                        >
                            Précédent
                        </button>
                        <button
                            disabled={page === pagination.last_page}
                            onClick={() => setPage(page + 1)}
                            className="px-6 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[10px] font-black text-gray-600 dark:text-white disabled:opacity-30 transition hover:bg-ocean-50"
                        >
                            Suivant
                        </button>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-xl" onClick={() => setShowCreateModal(false)}></div>
                    <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <UserForm
                            onCancel={() => setShowCreateModal(false)}
                            onSuccess={() => {
                                setShowCreateModal(false);
                                loadUsers();
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
