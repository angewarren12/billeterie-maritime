import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserCircleIcon, LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/mon-compte'); // Redirection vers le dashboard après login
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || "Email ou mot de passe incorrect.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-ocean-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 relative overflow-hidden border border-gray-100">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-ocean-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-50 rounded-full -ml-32 -mb-32 blur-3xl opacity-50"></div>

                <div className="relative z-10">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-ocean-500 to-ocean-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-ocean-200 rotate-3">
                            <UserCircleIcon className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Bon retour !</h1>
                        <p className="text-gray-500 font-medium">Connectez-vous pour accéder à vos billets et abonnements.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-2 animate-fade-in">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
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
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-3">Mot de passe</label>
                            <div className="relative">
                                <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-gray-900 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 transition-all placeholder-gray-300"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded text-ocean-600 border-gray-300 focus:ring-ocean-500" />
                                <span className="font-bold text-gray-500 group-hover:text-ocean-600 transition">Se souvenir de moi</span>
                            </label>
                            <a href="#" className="font-black text-ocean-600 hover:text-ocean-700 hover:underline">Mot de passe oublié ?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-5 rounded-2xl font-black text-white text-lg uppercase tracking-widest shadow-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-ocean-600 to-ocean-500 hover:to-ocean-400 shadow-ocean-200'}`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Connexion...
                                </>
                            ) : (
                                'Se Connecter'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 font-medium">
                            Pas encore de compte ?{' '}
                            <Link to="/inscription" className="font-black text-ocean-600 hover:text-ocean-700 hover:underline">
                                Créer un compte
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
