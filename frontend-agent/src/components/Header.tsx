import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    QrCodeIcon,
    ArrowRightOnRectangleIcon,
    SunIcon,
    MoonIcon
} from '@heroicons/react/24/outline';
import { agentService } from '../services/agentApi';

interface HeaderProps {
    title?: string;
    subtitle?: string;
    showBack?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title = "Agent Portal", subtitle = "Contrôle Quai", showBack = false }) => {
    const navigate = useNavigate();
    const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

    const toggleTheme = () => {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    const handleLogout = async () => {
        await agentService.logout();
        window.location.href = '/login';
    };

    return (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50 transition-colors">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-ocean-600 rounded-xl flex items-center justify-center shadow-lg shadow-ocean-600/20">
                    <QrCodeIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-sm font-black text-gray-900 dark:text-white tracking-tight uppercase">{title}</h2>
                    <p className="text-[10px] text-ocean-600 font-bold uppercase tracking-widest">{subtitle}</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={toggleTheme}
                    className="p-2 text-gray-400 hover:text-ocean-600 dark:hover:text-ocean-400 transition-colors"
                >
                    {isDark ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
                </button>
                <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                    <ArrowRightOnRectangleIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default Header;
