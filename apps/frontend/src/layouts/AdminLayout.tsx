import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
    Bars3Icon,
    CalendarIcon,
    ChartBarIcon,
    HomeIcon,
    UsersIcon,
    MapIcon,
    BuildingOfficeIcon,
    LifebuoyIcon,
    CheckBadgeIcon,
    CreditCardIcon,
    Squares2X2Icon,
    SignalIcon,
    BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';

const navigationGroups = [
    {
        name: 'Général',
        items: [
            { name: 'Dashboard', href: '/admin', icon: HomeIcon, roles: ['admin', 'super_admin', 'manager', 'guichetier', 'agent_embarquement', 'comptable'] },
            { name: 'Dashboard Gare', href: '/admin/supervisor/dashboard', icon: ChartBarIcon, roles: ['superviseur_gare'] },
            { name: 'Vente (POS)', href: '/admin/pos', icon: BuildingStorefrontIcon, roles: ['admin', 'super_admin', 'manager', 'guichetier', 'superviseur_gare'] },
            { name: 'Monitoring Accès', href: '/admin/monitoring', icon: SignalIcon, roles: ['admin', 'super_admin', 'manager', 'agent_embarquement', 'superviseur_gare'] },
        ]
    },
    {
        name: 'Gestion Opérationnelle',
        items: [
            { name: 'Guichets', href: '/admin/cash-desks', icon: BuildingStorefrontIcon, roles: ['admin', 'super_admin', 'manager'] },
            { name: 'Voyages', href: '/admin/trips', icon: CalendarIcon, roles: ['admin', 'super_admin', 'manager', 'agent_embarquement'] },
            { name: 'Réservations', href: '/admin/bookings', icon: CheckBadgeIcon, roles: ['admin', 'super_admin', 'manager', 'comptable'] },
        ]
    },
    {
        name: 'Logistique & Infrastructure',
        items: [
            { name: 'Lignes', href: '/admin/routes', icon: MapIcon, roles: ['admin', 'super_admin', 'manager'] },
            { name: 'Gares', href: '/admin/ports', icon: BuildingOfficeIcon, roles: ['admin', 'super_admin', 'manager'] },
            { name: 'Navires', href: '/admin/ships', icon: LifebuoyIcon, roles: ['admin', 'super_admin', 'manager'] },
        ]
    },
    {
        name: 'Clients & Tarification',
        items: [
            { name: 'Clients', href: '/admin/users', icon: UsersIcon, roles: ['admin', 'super_admin', 'manager'] },
            { name: 'Badges Actifs', href: '/admin/subscriptions', icon: CreditCardIcon, roles: ['admin', 'super_admin', 'manager', 'comptable'] },
            { name: 'Plans & Tarifs', href: '/admin/subscription-plans', icon: Squares2X2Icon, roles: ['admin', 'super_admin', 'manager'] },
        ]
    },
    {
        name: 'Analyses',
        items: [
            { name: 'Rapports', href: '/admin/reports', icon: ChartBarIcon, roles: ['admin', 'super_admin', 'manager', 'comptable'] },
        ]
    },
];

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const filteredNavigation = navigationGroups.map(group => ({
        ...group,
        items: group.items.filter(item => (item as any).roles.includes(user?.role))
    })).filter(group => group.items.length > 0);

    return (
        <>
            <div className="bg-gray-900 min-h-screen">
                <Transition.Root show={sidebarOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
                        <Transition.Child
                            as={Fragment}
                            enter="transition-opacity ease-linear duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition-opacity ease-linear duration-300"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" />
                        </Transition.Child>

                        <div className="fixed inset-0 flex">
                            <Transition.Child
                                as={Fragment}
                                enter="transition ease-in-out duration-300 transform"
                                enterFrom="-translate-x-full"
                                enterTo="translate-x-0"
                                leave="transition ease-in-out duration-300 transform"
                                leaveFrom="translate-x-0"
                                leaveTo="-translate-x-full"
                            >
                                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                                    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900/95 px-6 pb-4 ring-1 ring-white/10 backdrop-blur-xl">
                                        <div className="flex h-16 shrink-0 items-center">
                                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">Maritime OS</span>
                                        </div>
                                        <nav className="flex flex-1 flex-col">
                                            <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                                {filteredNavigation.map((group) => (
                                                    <li key={group.name}>
                                                        <div className="text-xs font-semibold leading-6 text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">{group.name}</div>
                                                        <ul role="list" className="-mx-2 space-y-1">
                                                            {group.items.map((item) => (
                                                                <li key={item.name}>
                                                                    <Link
                                                                        to={item.href}
                                                                        className={classNames(
                                                                            location.pathname === item.href
                                                                                ? 'bg-ocean-600/20 text-ocean-400 border-l-2 border-ocean-500'
                                                                                : 'text-gray-400 hover:text-white hover:bg-white/5',
                                                                            'group flex gap-x-3 rounded-r-md p-2 text-sm leading-6 font-semibold transition-all duration-200'
                                                                        )}
                                                                    >
                                                                        <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                                                                        {item.name}
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </li>
                                                ))}
                                            </ul>
                                        </nav>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </Dialog>
                </Transition.Root>

                {/* Static sidebar for desktop */}
                <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-[#0f172a] px-6 pb-4 border-r border-white/5 relative">
                        {/* Glow Effect */}
                        <div className="absolute top-0 left-0 w-full h-64 bg-ocean-500/10 blur-[100px] pointer-events-none" />

                        <div className="flex h-16 shrink-0 items-center z-10">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-500 to-teal-400 flex items-center justify-center mr-3 shadow-lg shadow-ocean-500/20">
                                <span className="font-bold text-white text-lg">M</span>
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">Maritime OS</span>
                        </div>
                        <nav className="flex flex-1 flex-col z-10">
                            <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                {filteredNavigation.map((group) => (
                                    <li key={group.name}>
                                        <div className="text-xs font-semibold leading-6 text-gray-500 uppercase tracking-wider mb-2">{group.name}</div>
                                        <ul role="list" className="-mx-2 space-y-1">
                                            {group.items.map((item) => (
                                                <li key={item.name}>
                                                    <Link
                                                        to={item.href}
                                                        className={classNames(
                                                            location.pathname === item.href
                                                                ? 'bg-gradient-to-r from-ocean-600/20 to-transparent text-ocean-400 border-l-2 border-ocean-500 shadow-[0_0_20px_rgba(14,165,233,0.1)]'
                                                                : 'text-gray-400 hover:text-white hover:bg-white/5',
                                                            'group flex gap-x-3 px-3 py-2.5 text-sm leading-6 font-medium rounded-r-lg transition-all duration-200 ease-in-out'
                                                        )}
                                                    >
                                                        <item.icon className={classNames(
                                                            location.pathname === item.href ? 'text-ocean-400' : 'text-gray-500 group-hover:text-white',
                                                            "h-5 w-5 shrink-0 transition-colors"
                                                        )} aria-hidden="true" />
                                                        {item.name}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        {/* User Profile Mini */}
                        <div className="mt-auto z-10 border-t border-white/10 pt-4 pb-2">
                            <div className="flex items-center gap-x-3 p-2 rounded-lg hover:bg-white/5 transition cursor-pointer">
                                <div className="h-9 w-9 rounded-full bg-gray-800 flex items-center justify-center border border-white/10">
                                    <span className="text-xs font-bold text-white">{user?.name?.substring(0, 2).toUpperCase()}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-white">{user?.name}</span>
                                    <span className="text-xs text-gray-500 capitalize">{user?.role || 'Admin'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:pl-72 flex flex-col min-h-screen transition-all duration-300">
                    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200/5 dark:border-gray-800/5 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
                        <button type="button" className="-m-2.5 p-2.5 text-gray-400 dark:text-gray-400 lg:hidden hover:text-gray-500 dark:hover:text-white transition" onClick={() => setSidebarOpen(true)}>
                            <span className="sr-only">Open sidebar</span>
                            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                        </button>

                        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                            {/* Search Bar Placeholder (Optional) */}
                            <div className="flex flex-1"></div>

                            <div className="flex items-center gap-x-4 lg:gap-x-6">
                                {/* Theme Toggle */}
                                <button
                                    onClick={toggleTheme}
                                    className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-white transition rounded-full hover:bg-gray-100 dark:hover:bg-white/5"
                                >
                                    <span className="sr-only">Changer de thème</span>
                                    {theme === 'dark' ? (
                                        <SunIcon className="h-6 w-6 text-yellow-500" />
                                    ) : (
                                        <MoonIcon className="h-6 w-6 text-gray-500" />
                                    )}
                                </button>

                                <button className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-white transition rounded-full hover:bg-gray-100 dark:hover:bg-white/5">
                                    <span className="sr-only">Notifications</span>
                                    {/* Bell Icon could go here */}
                                </button>
                                <div className="h-6 w-px bg-gray-200 dark:bg-white/10" aria-hidden="true" />
                                <button
                                    onClick={logout}
                                    className="text-sm font-semibold leading-6 text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 transition"
                                >
                                    Déconnexion
                                </button>
                            </div>
                        </div>
                    </div>

                    <main className="flex-1 py-10 bg-gray-50 dark:bg-[#0b1121] relative overflow-hidden transition-colors duration-300">
                        {/* Content Glow (Dark mode only) */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-ocean-900/10 via-transparent to-transparent pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-300" />

                        <div className="px-4 sm:px-6 lg:px-8 relative z-0">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
