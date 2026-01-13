import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { UserCircleIcon, TicketIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';

export default function Header() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    return (
        <header className="fixed w-full top-0 z-50 border-b border-white/10 bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-xl transition-all duration-300 shadow-sm">
            <nav className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-ocean-500 to-primary-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition shadow-lg shadow-ocean-200">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                            </svg>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-display font-bold gradient-text leading-tight dark:text-white">
                                Maritime Express
                            </h1>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-semibold italic">Sénégal 🇸🇳</p>
                        </div>
                    </Link>

                    {/* Navigation */}
                    {!user && (
                        <div className="hidden md:flex items-center gap-8">
                            <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-ocean-600 dark:hover:text-ocean-400 font-semibold transition text-sm uppercase tracking-wide">
                                Accueil
                            </Link>
                            <Link to="/trajets" className="text-gray-700 dark:text-gray-300 hover:text-ocean-600 dark:hover:text-ocean-400 font-medium transition">
                                Nos Trajets
                            </Link>

                            <Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-ocean-600 dark:hover:text-ocean-400 font-medium transition">
                                Contact
                            </Link>
                        </div>
                    )}

                    {/* CTA Buttons */}
                    <div className="flex items-center gap-4">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-yellow-400 transition"
                            aria-label="Toggle Dark Mode"
                        >
                            {theme === 'dark' ? (
                                <SunIcon className="w-6 h-6" />
                            ) : (
                                <MoonIcon className="w-6 h-6" />
                            )}
                        </button>

                        {user ? (
                            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
                                <Link to="/mon-compte" className="flex items-center gap-2 group">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400 transition truncate max-w-[120px]">{user.name}</p>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-tighter">Client Privilège</p>
                                    </div>
                                    <div className="w-10 h-10 bg-ocean-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-ocean-600 dark:text-ocean-400 border border-ocean-100 dark:border-gray-700 group-hover:bg-ocean-100 dark:group-hover:bg-gray-700 transition">
                                        <UserCircleIcon className="w-7 h-7" />
                                    </div>
                                </Link>
                                <button
                                    onClick={() => {
                                        logout();
                                        navigate('/connexion');
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-500 transition tooltip"
                                    title="Déconnexion"
                                >
                                    <ArrowLeftOnRectangleIcon className="w-6 h-6" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link to="/connexion" className="hidden sm:block px-4 py-2 text-ocean-600 dark:text-ocean-400 font-bold hover:bg-ocean-50 dark:hover:bg-white/5 rounded-lg transition text-sm">
                                    Connexion
                                </Link>
                                <Link to="/reserver" className="btn-primary text-sm shadow-md shadow-ocean-100">
                                    Réserver
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
}
