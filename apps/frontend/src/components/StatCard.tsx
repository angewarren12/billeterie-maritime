import React from 'react';

interface StatCardProps {
    name: string;
    value: string;
    icon: React.ElementType;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
    color: string;
}

export default function StatCard({ name, value, icon: Icon, change, changeType, color }: StatCardProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            {/* Background decoration */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${color} opacity-[0.03] group-hover:opacity-[0.08] rounded-full blur-2xl transition-opacity animate-pulse`}></div>

            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg shadow-gray-200 dark:shadow-none group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded-lg ${changeType === 'positive' ? 'bg-green-50 text-green-600 dark:bg-green-900/30' :
                        changeType === 'negative' ? 'bg-red-50 text-red-600 dark:bg-red-900/30' :
                            'bg-gray-50 text-gray-500 dark:bg-gray-700'
                    }`}>
                    {change}
                </div>
            </div>

            <div className="relative z-10">
                <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-1">
                    {value}
                </div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {name}
                </div>
            </div>
        </div>
    );
}
