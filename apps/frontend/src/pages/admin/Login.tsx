import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';

export default function AdminLogin() {
    const navigate = useNavigate();
    const { login } = useAuth(); // On réutilise le même contexte pour le moment

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
            // Redirection spécifique admin
            // TODO: Vérifier le rôle ici (ex: if (user.role !== 'admin') throw new Error('Accès refusé'))
            navigate('/admin');
        } catch (err: any) {
            console.error('Admin Login error:', err);
            setError("Accès refusé. Vérifiez vos identifiants.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-sm w-full bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-ocean-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-ocean-900/50">
                        <LockClosedIcon className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Maritime OS</h1>
                    <p className="text-gray-400 text-sm mt-1">Accès Sécurisé Backoffice</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-900/50 text-red-200 rounded-lg text-xs font-bold border border-red-800 flex items-center gap-2">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Identifiant</label>
                        <div className="relative">
                            <UserIcon className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white text-sm focus:border-ocean-500 focus:ring-1 focus:ring-ocean-500 transition-all placeholder-gray-600"
                                placeholder="admin@maritime.sn"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Mot de passe</label>
                        <div className="relative">
                            <LockClosedIcon className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white text-sm focus:border-ocean-500 focus:ring-1 focus:ring-ocean-500 transition-all placeholder-gray-600"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg font-bold text-white text-sm uppercase tracking-wide shadow-lg transition-all ${loading ? 'bg-gray-700 cursor-not-allowed' : 'bg-ocean-600 hover:bg-ocean-500 shadow-ocean-900/20'}`}
                    >
                        {loading ? 'Connexion...' : 'Accéder au Dashboard'}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-gray-700 pt-6">
                    <p className="text-gray-600 text-xs">
                        Accès réservé au personnel autorisé. <br /> Toute tentative d'intrusion sera signalée.
                    </p>
                </div>
            </div>
        </div>
    );
}
