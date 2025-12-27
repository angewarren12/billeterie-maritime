import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserCircleIcon, TicketIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

export default function Header() {
    const { user, logout } = useAuth();

    return (
        <header className="glass-effect sticky top-0 z-50 border-b border-gray-200">
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
                            <h1 className="text-xl font-display font-bold gradient-text leading-tight">
                                Maritime Express
                            </h1>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold italic">Sénégal 🇸🇳</p>
                        </div>
                    </Link>

                    {/* Navigation */}
                    {!user && (
                        <div className="hidden md:flex items-center gap-8">
                            <Link to="/" className="text-gray-600 hover:text-ocean-600 font-semibold transition text-sm uppercase tracking-wide">
                                Accueil
                            </Link>
                            <Link to="/trajets" className="text-gray-700 hover:text-ocean-600 font-medium transition">
                                Nos Trajets
                            </Link>

                            <Link to="/contact" className="text-gray-700 hover:text-ocean-600 font-medium transition">
                                Contact
                            </Link>
                        </div>
                    )}

                    {/* CTA Buttons */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                                <Link to="/mon-compte" className="flex items-center gap-2 group">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-bold text-gray-900 group-hover:text-ocean-600 transition truncate max-w-[120px]">{user.name}</p>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Client Privilège</p>
                                    </div>
                                    <div className="w-10 h-10 bg-ocean-50 rounded-full flex items-center justify-center text-ocean-600 border border-ocean-100 group-hover:bg-ocean-100 transition">
                                        <UserCircleIcon className="w-7 h-7" />
                                    </div>
                                </Link>
                                <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 transition tooltip" title="Déconnexion">
                                    <ArrowLeftOnRectangleIcon className="w-6 h-6" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link to="/connexion" className="hidden sm:block px-4 py-2 text-ocean-600 font-bold hover:bg-ocean-50 rounded-lg transition text-sm">
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
