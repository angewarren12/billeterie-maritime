import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiService } from '../../../services/api';
import {
    UserIcon,
    TicketIcon,
    IdentificationIcon,
    ClockIcon,
    ChevronLeftIcon,
    EnvelopeIcon,
    PhoneIcon,
    ChevronRightIcon,
    PlusIcon,
    BriefcaseIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import SubscriptionModal from './SubscriptionModal';

export default function UserDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'subscriptions' | 'logs'>('profile');
    const [showSubModal, setShowSubModal] = useState(false);

    useEffect(() => {
        if (id) loadUserDetails();
    }, [id]);

    const loadUserDetails = async () => {
        try {
            setLoading(true);
            const response = await apiService.getAdminUserDetails(id!);
            setData(response);

            // Si c'est un agent, changer le tab par défaut ou masquer certains
            if (response.user.role !== 'client' && activeTab === 'subscriptions') {
                setActiveTab('profile');
            }
        } catch (error) {
            console.error("Error loading user details", error);
            toast.error("Échec du chargement des détails de l'utilisateur");
        } finally {
            setLoading(false);
        }
    };

    const handleNewBooking = () => {
        // Rediriger vers la liste des voyages avec l'ID du client pour réservation forcée
        navigate(`/admin/trips?userId=${data.user.id}`);
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 border-4 border-ocean-500/20 border-t-ocean-500 rounded-full animate-spin"></div>
                <p className="text-gray-400 font-black uppercase tracking-widest animate-pulse">Chargement du profil...</p>
            </div>
        );
    }

    if (!data) return null;

    const { user, stats, access_logs } = data;
    const isClient = user.role === 'client';

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Nav & Back */}
            <Link to="/admin/users" className="inline-flex items-center gap-2 text-gray-500 hover:text-ocean-600 dark:hover:text-white transition-colors font-bold group">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-transparent flex items-center justify-center group-hover:bg-ocean-500 group-hover:text-white transition-colors shadow-sm dark:shadow-none">
                    <ChevronLeftIcon className="w-4 h-4" />
                </div>
                Retour au listing
            </Link>

            {/* User Header Card */}
            <div className="relative overflow-hidden bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 rounded-[3rem] border border-gray-200 dark:border-white/5 shadow-xl dark:shadow-2xl p-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-ocean-500/5 dark:bg-ocean-500/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>

                <div className="relative flex flex-col lg:flex-row items-center gap-10">
                    <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center text-white text-5xl font-black shadow-2xl border-4 border-white/10 ${isClient ? 'bg-gradient-to-br from-ocean-500 to-ocean-700' : 'bg-gradient-to-br from-purple-500 to-indigo-700'}`}>
                        {user.name.charAt(0)}
                    </div>

                    <div className="flex-1 text-center lg:text-left">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight uppercase">{user.name}</h1>
                            <span className={`w-fit mx-auto lg:mx-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isClient ? 'bg-ocean-50 dark:bg-ocean-500/20 text-ocean-600 dark:text-ocean-400' : 'bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400'}`}>
                                {isClient ? 'Passager / Client' : `Personnel / ${user.role}`}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-4">
                            <span className="px-4 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <EnvelopeIcon className="w-4 h-4 text-ocean-500 dark:text-ocean-400" />
                                {user.email}
                            </span>
                            <span className="px-4 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <PhoneIcon className="w-4 h-4 text-ocean-500 dark:text-ocean-400" />
                                {user.phone || 'Non renseigné'}
                            </span>
                        </div>
                    </div>

                    {isClient ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-3xl border border-gray-100 dark:border-white/5 text-center px-8">
                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Voyages</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats?.total_bookings || 0}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-3xl border border-gray-100 dark:border-white/5 text-center px-8">
                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Total Payé</p>
                                <p className="text-2xl font-black text-ocean-600 dark:text-ocean-400">{Number(stats?.total_spent || 0).toLocaleString()} <span className="text-xs">F</span></p>
                            </div>
                            <div className="col-span-2 md:col-span-1 bg-gray-50 dark:bg-white/5 p-4 rounded-3xl border border-gray-100 dark:border-white/5 text-center px-8">
                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Badge Actif</p>
                                {stats?.active_badge?.plan ? (
                                    <p className="text-xs font-black text-green-600 dark:text-green-400 uppercase tracking-tight mt-1 truncate max-w-[120px]">{stats.active_badge.plan.name}</p>
                                ) : (
                                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase italic mt-1">Aucun</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-purple-50 dark:bg-purple-500/10 p-8 rounded-[2.5rem] border border-purple-200 dark:border-purple-500/20 text-center">
                            <BriefcaseIcon className="w-10 h-10 text-purple-500 mx-auto mb-3" />
                            <p className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">Poste occupé</p>
                            <p className="text-xl font-black text-gray-900 dark:text-white uppercase mt-1">{user.role}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex flex-wrap gap-2 p-2 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-white/5 rounded-2xl w-fit mx-auto lg:mx-0 shadow-sm dark:shadow-none">
                {[
                    { id: 'profile', label: 'Profil', icon: UserIcon },
                    { id: 'bookings', label: 'Réservations', icon: TicketIcon, show: isClient },
                    { id: 'subscriptions', label: 'Abonnements', icon: IdentificationIcon, show: isClient },
                    { id: 'logs', label: 'Activités / Accès', icon: ClockIcon },
                ].filter(t => t.show !== false).map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                            ? 'bg-ocean-500 text-white shadow-lg shadow-ocean-500/30'
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-gray-800/30 rounded-[3rem] border border-gray-200 dark:border-white/5 p-8 lg:p-12 shadow-xl dark:shadow-2xl min-h-[400px]">
                {/* PROFIL TAB */}
                {activeTab === 'profile' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-ocean-500 rounded-full"></div>
                                    Informations de compte
                                </h3>
                                <div className="grid grid-cols-1 gap-6">
                                    <InfoRow label="ID Système" value={user.id} />
                                    <InfoRow label="Nom Complet" value={user.name} />
                                    <InfoRow label="Email" value={user.email} />
                                    <InfoRow label="Téléphone" value={user.phone} />
                                    {isClient && (
                                        <>
                                            <InfoRow label="Type Passager" value={user.passenger_type} isBadge />
                                            <InfoRow label="Groupe Nationalité" value={user.nationality_group} isBadge />
                                        </>
                                    )}
                                    {!isClient && (
                                        <InfoRow label="Rôle Plateforme" value={user.role} isBadge />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-orange-500 dark:bg-primary-500 rounded-full"></div>
                                    Statistiques
                                </h3>
                                <div className="grid grid-cols-1 gap-6">
                                    <InfoRow label="Date d'inscription" value={new Date(user.created_at).toLocaleDateString()} />
                                    <InfoRow label="Dernière modification" value={new Date(user.updated_at).toLocaleDateString()} />
                                    {isClient && (
                                        <>
                                            <InfoRow label="Total Réservations" value={stats.total_bookings} />
                                            <InfoRow label="Dépenses Totales" value={`${Number(stats.total_spent || 0).toLocaleString()} FCFA`} />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* BOOKINGS TAB */}
                {activeTab === 'bookings' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Historique des réservations</h3>
                            <button
                                onClick={handleNewBooking}
                                className="bg-ocean-600 hover:bg-ocean-500 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition-all shadow-lg shadow-ocean-600/20 active:scale-95 text-xs uppercase tracking-widest"
                            >
                                <PlusIcon className="w-5 h-5" />
                                Nouvelle Réservation
                            </button>
                        </div>

                        <div className="space-y-4">
                            {user.bookings?.length === 0 ? (
                                <p className="text-center py-20 text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Aucune réservation pour le moment</p>
                            ) : (
                                user.bookings.map((booking: any) => (
                                    <div key={booking.id} className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:border-ocean-200 dark:hover:border-white/10 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 bg-white dark:bg-ocean-500/10 rounded-xl border border-gray-100 dark:border-transparent flex items-center justify-center text-ocean-500 dark:text-ocean-400 shadow-sm dark:shadow-none">
                                                <TicketIcon className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <p className="text-gray-900 dark:text-white font-black text-lg uppercase tracking-tight">Ref: {booking.booking_reference}</p>
                                                <p className="text-gray-500 text-xs font-bold mt-1">
                                                    {booking.trip?.route?.departure_port?.name || 'Depart Inconnu'} → {booking.trip?.route?.arrival_port?.name || 'Arrivée Inconnue'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap justify-center gap-8">
                                            <div className="text-center">
                                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Date Voyage</p>
                                                <p className="text-sm font-bold text-gray-700 dark:text-white/90">
                                                    {booking.trip?.departure_time ? new Date(booking.trip.departure_time).toLocaleDateString() : 'Date Inconnue'}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Passagers</p>
                                                <p className="text-sm font-bold text-gray-700 dark:text-white/90">{booking.tickets?.length || 0}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Montant</p>
                                                <p className="text-sm font-black text-ocean-600 dark:text-ocean-400">{Number(booking.total_amount).toLocaleString()} F</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${booking.status === 'confirmed' ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20' : 'bg-gray-100 dark:bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/5'
                                                }`}>
                                                {booking.status}
                                            </span>
                                            <Link to={`/admin/bookings/${booking.id}`} className="p-2 text-gray-400 hover:text-ocean-600 dark:text-gray-500 dark:hover:text-white transition-colors">
                                                <ChevronRightIcon className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* SUBSCRIPTIONS TAB */}
                {activeTab === 'subscriptions' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Badges & Abonnements</h3>
                            <button
                                onClick={() => setShowSubModal(true)}
                                className="bg-ocean-600 hover:bg-ocean-500 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition-all shadow-lg shadow-ocean-600/20 active:scale-95 text-xs uppercase tracking-widest"
                            >
                                <PlusIcon className="w-5 h-5" />
                                Nouveau Abonnement
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {user.subscriptions?.length === 0 ? (
                                <p className="col-span-full text-center py-20 text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Aucun abonnement enregistré</p>
                            ) : (
                                user.subscriptions.map((sub: any) => (
                                    <div key={sub.id} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-white/5 rounded-[2rem] p-8 relative overflow-hidden group hover:border-ocean-300 dark:hover:border-ocean-500/30 transition-all shadow-sm">
                                        <div className={`absolute top-0 right-0 w-2 h-full ${sub.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>

                                        <IdentificationIcon className="w-12 h-12 text-ocean-200 dark:text-ocean-500/20 mb-6 group-hover:text-ocean-500 transition-colors" />

                                        <h4 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-1">{sub.plan.name}</h4>
                                        <p className="text-xs font-black text-ocean-600 dark:text-ocean-500 uppercase tracking-widest mb-6">UID: {sub.rfid_card_id || 'NON ASSOCIÉ'}</p>

                                        <div className="space-y-4 mb-8">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 font-bold">Solde</span>
                                                <span className="text-gray-900 dark:text-white font-black">
                                                    {sub.plan.credit_type === 'unlimited' ? 'ILLIMITÉ' :
                                                        sub.voyage_credits_initial > 0 ? `${sub.voyage_credits_remaining} voyages` :
                                                            `${Number(sub.legacy_credit_fcfa).toLocaleString()} FCFA`}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 font-bold">Expire le</span>
                                                <span className="text-gray-900 dark:text-white font-bold">{new Date(sub.end_date).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${sub.status === 'active' ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20' : 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/20'
                                            }`}>
                                            {sub.status === 'active' ? 'Actif' : 'Expiré / Bloqué'}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* LOGS TAB */}
                {activeTab === 'logs' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8">
                            {isClient ? 'Historique des accès / passages' : 'Logs d\'activité plateforme'}
                        </h3>
                        <div className="space-y-4">
                            {access_logs?.length === 0 ? (
                                <p className="text-center py-20 text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Aucune activité enregistrée récemment</p>
                            ) : (
                                <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/5">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 dark:bg-white/5">
                                            <tr>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Moment</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Dispositif / Port</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Direction</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">Statut</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Badge utilisé</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                            {access_logs.map((log: any) => (
                                                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-6 py-4">
                                                        <p className="text-gray-900 dark:text-white font-bold text-sm">{new Date(log.created_at).toLocaleDateString()}</p>
                                                        <p className="text-gray-400 dark:text-gray-500 text-[10px] uppercase font-bold">{new Date(log.created_at).toLocaleTimeString()}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-gray-700 dark:text-white/80 font-bold text-sm">{log.device?.name || 'Inconnu'}</p>
                                                        <p className="text-ocean-600 dark:text-ocean-500/60 text-[10px] font-black uppercase tracking-widest">{log.device?.port?.name || 'Port Indéfini'}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${log.direction === 'entry' ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                                                            }`}>
                                                            {log.direction === 'entry' ? 'Entrée' : 'Sortie'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${log.status === 'success' ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-500'
                                                            }`}>
                                                            {log.status === 'success' ? '✓' : '✗'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-gray-500 dark:text-white/60 text-xs font-bold">{log.subscription?.plan?.name || 'Ticket Unitaire'}</p>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Subscription Modal */}
            {showSubModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-xl" onClick={() => setShowSubModal(false)}></div>
                    <div className="relative w-full max-w-2xl">
                        <SubscriptionModal
                            userId={user.id}
                            userName={user.name}
                            onCancel={() => setShowSubModal(false)}
                            onSuccess={() => {
                                setShowSubModal(false);
                                loadUserDetails();
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoRow({ label, value, isBadge = false }: { label: string; value: any; isBadge?: boolean }) {
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</span>
            {isBadge ? (
                <span className="w-fit px-3 py-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-ocean-600 dark:text-ocean-400 text-[10px] font-black uppercase tracking-tight">
                    {value || '--'}
                </span>
            ) : (
                <span className="text-gray-900 dark:text-white font-bold tracking-tight">{value || '--'}</span>
            )}
        </div>
    );
}
