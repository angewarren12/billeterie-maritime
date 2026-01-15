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
        console.log('Login attempt for email:', email);
        setLoading(true);

        try {
            const user = await login(email, password);
            console.log('Login successful, user:', user);
            navigate('/mon-compte'); // Redirection vers le dashboard après login
        } catch (err: any) {
            console.error('Login error detail:', err.response?.data);
            setError(err.response?.data?.message || "Email ou mot de passe incorrect.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white md:bg-gray-50/50 flex items-center justify-center p-0 md:p-4">
            <div className="max-w-md w-full bg-white md:rounded-[2.5rem] md:shadow-2xl p-8 md:p-12 relative overflow-hidden min-h-screen md:min-h-0 flex flex-col justify-center">
                {/* Decoration */}
                <div className="hidden md:block absolute top-0 right-0 w-64 h-64 bg-ocean-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
                <div className="hidden md:block absolute bottom-0 left-0 w-64 h-64 bg-orange-50 rounded-full -ml-32 -mb-32 blur-3xl opacity-50"></div>

                <div className="relative z-10 w-full">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-ocean-500 to-ocean-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-ocean-200 rotate-3 animate-float">
                            <UserCircleIcon className="w-10 h-10" />
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">Bon retour !</h1>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">REJOIGNEZ VOTRE ESPACE PERSONNEL</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50/50 backdrop-blur-md border-2 border-red-100 text-red-700 rounded-2xl text-sm font-bold flex items-center gap-3 animate-horizontal-shake">
                            <span className="text-xl">🚨</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">VOTRE EMAIL</label>
                            <div className="relative group">
                                <EnvelopeIcon className="w-6 h-6 text-ocean-500 absolute left-4 top-1/2 transform -translate-y-1/2 transition-transform group-focus-within:scale-110" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="input-field pl-14"
                                    placeholder="nom@exemple.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">MOT DE PASSE</label>
                            <div className="relative group">
                                <LockClosedIcon className="w-6 h-6 text-ocean-500 absolute left-4 top-1/2 transform -translate-y-1/2 transition-transform group-focus-within:scale-110" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="input-field pl-14"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-3 cursor-pointer group select-none">
                                <div className="relative">
                                    <input type="checkbox" className="peer sr-only" />
                                    <div className="w-5 h-5 bg-gray-100 border-2 border-gray-100 rounded-md peer-checked:bg-ocean-500 peer-checked:border-ocean-500 transition-all"></div>
                                    <svg className="absolute inset-0 w-3 h-3 text-white m-auto opacity-0 peer-checked:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                                </div>
                                <span className="font-bold text-xs text-gray-400 group-hover:text-ocean-600 transition">Se souvenir de moi</span>
                            </label>
                            <a href="#" className="text-xs font-black text-ocean-600 hover:text-ocean-700 tracking-tight">Oublié ?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-5 text-lg group relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                {loading ? (
                                    <>
                                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        VÉRIFICATION...
                                    </>
                                ) : (
                                    <>
                                        SE CONNECTER
                                        <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </>
                                )}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                            NOUVEAU ICI ?{' '}
                            <Link to="/inscription" className="text-ocean-600 hover:underline">
                                CRÉER UN COMPTE
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
