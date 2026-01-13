import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { LockClosedIcon, EnvelopeIcon, PhoneIcon, UserIcon } from '@heroicons/react/24/outline';

export default function Register() {
    const navigate = useNavigate();
    const { updateAuthState } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        if (password.length < 8) {
            setError("Le mot de passe doit contenir au moins 8 caractères.");
            return;
        }

        setLoading(true);

        try {
            const response = await apiService.register({
                name,
                email,
                phone,
                password,
                password_confirmation: confirmPassword
            });

            if (response.token && response.user) {
                updateAuthState(response.token, response.user);
                alert("Compte créé avec succès ! Bienvenue.");
                navigate('/mon-compte');
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.response?.data?.message || "Erreur lors de l'inscription. Vérifiez vos informations.",);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-ocean-50 flex items-center justify-center p-4 py-12">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 relative overflow-hidden border border-gray-100">
                {/* Decoration */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-ocean-50 rounded-full -ml-32 -mt-32 blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mb-32 blur-3xl opacity-50"></div>

                <div className="relative z-10">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-emerald-200 -rotate-3">
                            <UserIcon className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Créer un compte</h1>
                        <p className="text-gray-500 font-medium">Rejoignez-nous pour voyager plus simplement.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-2 animate-fade-in">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-3">Nom Complet</label>
                            <div className="relative">
                                <UserIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-gray-900 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 transition-all placeholder-gray-300"
                                    placeholder="Prénom NOM"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-3">Email</label>
                            <div className="relative">
                                <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-gray-900 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 transition-all placeholder-gray-300"
                                    placeholder="exemple@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-3">Téléphone</label>
                            <div className="relative">
                                <PhoneIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-gray-900 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 transition-all placeholder-gray-300"
                                    placeholder="+221 77 000 00 00"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-3">Mot de passe</label>
                            <div className="relative">
                                <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-gray-900 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 transition-all placeholder-gray-300"
                                    placeholder="8 caractères min."
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-3">Confirmer mot de passe</label>
                            <div className="relative">
                                <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-gray-900 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 transition-all placeholder-gray-300"
                                    placeholder="Répétez le mot de passe"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-5 rounded-2xl font-black text-white text-lg uppercase tracking-widest shadow-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:to-teal-500 shadow-emerald-200'}`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Création en cours...
                                </>
                            ) : (
                                'Créer mon compte'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 font-medium">
                            Déjà inscris ?{' '}
                            <Link to="/connexion" className="font-black text-ocean-600 hover:text-ocean-700 hover:underline">
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
