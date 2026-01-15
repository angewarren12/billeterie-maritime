import { Link, useLocation } from 'react-router-dom';
import {
    HomeIcon,
    MapPinIcon,
    UserCircleIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import {
    HomeIcon as HomeIconSolid,
    MapPinIcon as MapPinIconSolid,
    UserCircleIcon as UserCircleIconSolid,
    MagnifyingGlassIcon as MagnifyingGlassIconSolid
} from '@heroicons/react/24/solid';


export default function BottomNav() {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { name: 'Accueil', path: '/', icon: HomeIcon, activeIcon: HomeIconSolid },
        { name: 'Trajets', path: '/trajets', icon: MapPinIcon, activeIcon: MapPinIconSolid },
        { name: 'Réserver', path: '/reserver', icon: MagnifyingGlassIcon, activeIcon: MagnifyingGlassIconSolid },
        { name: 'Compte', path: '/mon-compte', icon: UserCircleIcon, activeIcon: UserCircleIconSolid },
    ];


    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-gray-100 pb-safe animate-slide-up">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => {
                    const Active = isActive(item.path);
                    const Icon = Active ? item.activeIcon : item.icon;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`mobile-nav-item flex-1 ${Active ? 'text-ocean-600' : 'text-gray-400'}`}
                        >
                            <Icon className={`w-6 h-6 ${Active ? 'animate-bounce-subtle' : ''}`} />
                            <span className="text-[10px] font-black">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
