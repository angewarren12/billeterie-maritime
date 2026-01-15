import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { UserCircleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';

export default function Header() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`fixed w-full top-0 z-50 transition-all duration-500 ${isScrolled
                ? 'bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl py-2 shadow-lg border-b border-gray-100 dark:border-gray-800'
                : 'bg-transparent py-4'
                }`}
        >
            <nav className="container mx-auto px-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className={`transition-all duration-500 bg-gradient-to-br from-ocean-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-ocean-200/50 ${isScrolled ? 'w-10 h-10' : 'w-12 h-12'
                            }`}>
                            <svg className={`${isScrolled ? 'w-6 h-6' : 'w-7 h-7'} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <h1 className={`font-black text-gray-900 dark:text-white transition-all duration-500 ${isScrolled ? 'text-lg' : 'text-xl'
                                }`}>
                                Maritime <span className="text-ocean-600">Express</span>
                            </h1>
                            {!isScrolled && (
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-black italic -mt-1 hidden sm:block">Sénégal 🇸🇳</p>
                            )}
                        </div>
                    </Link>

                    {/* Navigation Desktop Only */}
                    <div className="hidden lg:flex items-center gap-10">
                        <Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-ocean-600 font-bold transition-all text-sm uppercase tracking-widest">
                            Accueil
                        </Link>
                        <Link to="/trajets" className="text-gray-500 dark:text-gray-400 hover:text-ocean-600 font-bold transition-all text-sm uppercase tracking-widest">
                            Nos Trajets
                        </Link>
                        <Link to="/contact" className="text-gray-500 dark:text-gray-400 hover:text-ocean-600 font-bold transition-all text-sm uppercase tracking-widest">
                            Contact
                        </Link>
                    </div>


                    {/* Actions */}
                    <div className="flex items-center gap-2 md:gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-ocean-600 transition-all active:scale-90"
                        >
                            {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                        </button>

                        {user ? (
                            <div className="flex items-center gap-3 pl-4 border-l border-gray-100 dark:border-gray-800">
                                <Link to="/mon-compte" className="flex items-center gap-2 group">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-ocean-600 transition truncate max-w-[120px]">{user.name}</p>
                                        <p className="text-[10px] text-ocean-600 uppercase font-black tracking-tighter">Client VIP</p>
                                    </div>
                                    <div className="w-10 h-10 bg-ocean-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-ocean-600 border border-ocean-100 dark:border-gray-700 active:scale-90 transition-all">
                                        <UserCircleIcon className="w-7 h-7" />
                                    </div>
                                </Link>
                                <button
                                    onClick={() => { logout(); navigate('/connexion'); }}
                                    className="p-2.5 text-gray-400 hover:text-red-500 transition-all active:scale-90"
                                >
                                    <ArrowLeftOnRectangleIcon className="w-6 h-6" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/connexion" className="hidden sm:block px-6 py-2.5 text-gray-500 font-black hover:text-ocean-600 transition-all text-sm uppercase tracking-wider">
                                    Connexion
                                </Link>
                                <Link to="/reserver" className="btn-primary text-xs !py-2.5 !px-6">
                                    Réserver
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
}
