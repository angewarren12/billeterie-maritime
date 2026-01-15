import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { apiService } from '../services/api';
import { LockClosedIcon, EnvelopeIcon, PhoneIcon, UserIcon } from '@heroicons/react/24/outline';

export default function Register() {
    const navigate = useNavigate();


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
        console.log('Register attempt:', { name, email, phone });

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
            console.log('Register response:', response);

            if (response.data) {
                // Note: Laravel returns { data: user } for the web SPA
                const user = response.data;
                console.log('User registered successfully:', user);
                alert("Compte créé avec succès ! Bienvenue.");
                navigate('/mon-compte');
            }
        } catch (err: any) {
            console.error('Registration error detail:', err.response?.data);
            setError(err.response?.data?.message || "Erreur lors de l'inscription. Vérifiez vos informations.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white md:bg-gray-50/50 flex items-center justify-center p-0 md:p-4 py-0 md:py-12">
            <div className="max-w-md w-full bg-white md:rounded-[2.5rem] md:shadow-2xl p-8 md:p-12 relative overflow-hidden min-h-screen md:min-h-0 flex flex-col justify-center">
                {/* Decoration */}
                <div className="hidden md:block absolute top-0 left-0 w-64 h-64 bg-ocean-50 rounded-full -ml-32 -mt-32 blur-3xl opacity-50"></div>
                <div className="hidden md:block absolute bottom-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mb-32 blur-3xl opacity-50"></div>

                <div className="relative z-10 w-full">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-emerald-200 -rotate-3 animate-float">
                            <UserIcon className="w-10 h-10" />
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">Bienvenue !</h1>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">REJOIGNEZ L'AVENTURE MARITIME</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50/50 backdrop-blur-md border-2 border-red-100 text-red-700 rounded-2xl text-sm font-bold flex items-center gap-3 animate-horizontal-shake">
                            <span className="text-xl">🚨</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">NOM COMPLET</label>
                            <div className="relative group">
                                <UserIcon className="w-6 h-6 text-emerald-500 absolute left-4 top-1/2 transform -translate-y-1/2 transition-transform group-focus-within:scale-110" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="input-field pl-14"
                                    placeholder="Prénom NOM"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">VOTRE EMAIL</label>
                            <div className="relative group">
                                <EnvelopeIcon className="w-6 h-6 text-emerald-500 absolute left-4 top-1/2 transform -translate-y-1/2 transition-transform group-focus-within:scale-110" />
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

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">TÉLÉPHONE</label>
                            <div className="relative group">
                                <PhoneIcon className="w-6 h-6 text-emerald-500 absolute left-4 top-1/2 transform -translate-y-1/2 transition-transform group-focus-within:scale-110" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="input-field pl-14"
                                    placeholder="+221 77 000 00 00"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">MOT DE PASSE</label>
                                <div className="relative group">
                                    <LockClosedIcon className="w-6 h-6 text-emerald-500 absolute left-4 top-1/2 transform -translate-y-1/2 transition-transform group-focus-within:scale-110" />
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

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">CONFIRMATION</label>
                                <div className="relative group">
                                    <LockClosedIcon className="w-6 h-6 text-emerald-500 absolute left-4 top-1/2 transform -translate-y-1/2 transition-transform group-focus-within:scale-110" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="input-field pl-14"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:scale-[1.02] active:scale-95 text-white w-full py-5 rounded-3xl font-black text-lg uppercase tracking-widest shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-3 group overflow-hidden relative"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                {loading ? (
                                    <>
                                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        INSCRIPTION...
                                    </>
                                ) : (
                                    <>
                                        COMMENCER L'AVENTURE
                                        <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </>
                                )}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                            DÉJÀ INSCRIT ?{' '}
                            <Link to="/connexion" className="text-ocean-600 hover:underline">
                                SE CONNECTER
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
