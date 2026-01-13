import React, { useState } from 'react';
import { agentService } from '../services/agentApi';
import { LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/solid';

const Login = ({ onLogin }: { onLogin: () => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await agentService.login(email, password);
            onLogin();
        } catch (err: any) {
            setError('Identifiants invalides ou problème de connexion.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-ocean-900 flex flex-col justify-center px-6 py-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-ocean-600/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-ocean-800/20 rounded-full blur-3xl -ml-32 -mb-32"></div>

            <div className="relative z-10 w-full max-w-sm mx-auto">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/20">
                        <LockClosedIcon className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase">Agent Portal</h1>
                    <p className="text-ocean-300 font-bold text-sm mt-2">APPLICATION DE CONTRÔLE</p>
                </div>

                <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-ocean-300 uppercase tracking-widest ml-1">Email Professionnel</label>
                            <div className="relative">
                                <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ocean-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/10 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500 transition-all font-bold"
                                    placeholder="agent@portdakar.sn"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-ocean-300 uppercase tracking-widest ml-1">Mot de Passe</label>
                            <div className="relative">
                                <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ocean-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/10 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500 transition-all font-bold"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-red-400 text-xs font-bold text-center bg-red-400/10 py-3 rounded-xl border border-red-400/20">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-ocean-900 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-ocean-50 transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? 'Connexion...' : 'Se Connecter'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
