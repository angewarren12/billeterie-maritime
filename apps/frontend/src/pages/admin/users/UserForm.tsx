import { useState } from 'react';
import { apiService } from '../../../services/api';
import { UserPlusIcon, XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface UserFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export default function UserForm({ onSuccess, onCancel }: UserFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'client',
        nationality_group: 'national',
        passenger_type: 'adult',
        document_number: '',
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await apiService.createUser(formData);
            toast.success("Utilisateur créé avec succès");
            onSuccess();
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.message || "Une erreur est survenue lors de la création";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { id: 'client', name: 'Client (Passager)', icon: '👤' },
        { id: 'agent_embarquement', name: "Agent d'Embarquement", icon: '⚓' },
        { id: 'guichetier', name: 'Guichetier (Vendeur)', icon: '🎫' },
        { id: 'manager', name: 'Manager Opérationnel', icon: '🏢' },
        { id: 'comptable', name: 'Comptable', icon: '💰' },
        { id: 'admin', name: 'Administrateur', icon: '🛡️' },
    ];

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-ocean-50 dark:bg-ocean-500/20 flex items-center justify-center">
                        <UserPlusIcon className="w-6 h-6 text-ocean-600 dark:text-ocean-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Nouvel Utilisateur</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mt-0.5">Configuration du compte plateforme</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onCancel}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                    <XMarkIcon className="w-6 h-6 text-gray-400" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Section 1: Rôle et Identité */}
                <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                        <label className="block text-[10px] font-black text-ocean-600 dark:text-ocean-400 uppercase tracking-widest mb-3 ml-1">Type de Compte (Rôle)</label>
                        <div className="grid grid-cols-2 gap-2">
                            {roles.map(role => (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: role.id })}
                                    className={`flex items-center gap-2 p-3 rounded-xl text-left border-2 transition-all ${formData.role === role.id ? 'bg-ocean-600 border-ocean-600 text-white shadow-lg shadow-ocean-600/20' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-white/5 text-gray-600 dark:text-gray-400 hover:border-ocean-300'}`}
                                >
                                    <span className="text-lg">{role.icon}</span>
                                    <span className="text-[10px] font-black uppercase leading-tight">{role.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Nom Complet</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-white/5 rounded-2xl py-3.5 px-5 text-gray-900 dark:text-white focus:ring-2 focus:ring-ocean-500 transition-all font-bold"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Email (Identifiant)</label>
                            <input
                                type="email"
                                required
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-white/5 rounded-2xl py-3.5 px-5 text-gray-900 dark:text-white focus:ring-2 focus:ring-ocean-500 transition-all font-bold"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Sécurité et Profil (Conditonnel pour clients) */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Téléphone</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-white/5 rounded-2xl py-3.5 px-5 text-gray-900 dark:text-white focus:ring-2 focus:ring-ocean-500 transition-all font-bold"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Mot de passe temporaire</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-white/5 rounded-2xl py-3.5 px-5 text-gray-900 dark:text-white focus:ring-2 focus:ring-ocean-500 transition-all font-bold"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    {formData.role === 'client' && (
                        <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 space-y-4 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheckIcon className="w-4 h-4 text-ocean-500" />
                                <span className="text-[10px] font-black uppercase text-ocean-600 tracking-widest">Configuration Passager</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Nationalité</label>
                                    <select
                                        className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-white/5 rounded-xl py-2 px-3 text-xs font-bold"
                                        value={formData.nationality_group}
                                        onChange={e => setFormData({ ...formData, nationality_group: e.target.value })}
                                    >
                                        <option value="national">National</option>
                                        <option value="resident">Résident</option>
                                        <option value="african">Africain</option>
                                        <option value="hors_afrique">Étranger</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Catégorie</label>
                                    <select
                                        className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-white/5 rounded-xl py-2 px-3 text-xs font-bold"
                                        value={formData.passenger_type}
                                        onChange={e => setFormData({ ...formData, passenger_type: e.target.value })}
                                    >
                                        <option value="adult">Adulte</option>
                                        <option value="child">Enfant</option>
                                        <option value="baby">Bébé</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">N° Pièce d'Identité</label>
                                <input
                                    type="text"
                                    className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-white/5 rounded-xl py-2 px-3 text-xs font-bold"
                                    value={formData.document_number}
                                    onChange={e => setFormData({ ...formData, document_number: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-10 p-2 bg-gray-50 dark:bg-white/5 rounded-3xl">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-8 py-3.5 text-sm font-black text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all uppercase tracking-widest"
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-ocean-600 hover:bg-ocean-500 dark:bg-ocean-500 dark:hover:bg-ocean-400 text-white px-10 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-ocean-600/20 disabled:opacity-50 active:scale-95"
                >
                    {loading ? 'Création...' : "Créer l'Utilisateur"}
                </button>
            </div>
        </form>
    );
}
