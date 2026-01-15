import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService, type Route } from '../services/api';
import {
    ChevronRightIcon,
    MapPinIcon,
    ArrowRightIcon,
    ClockIcon,
    RocketLaunchIcon
} from '@heroicons/react/24/outline';

export default function Trajets() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiService.getPublicRoutes()
            .then(data => setRoutes(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen pt-32 px-6 bg-slate-50">
                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="h-20 w-1/3 bg-gray-200 rounded-2xl animate-pulse mb-12" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-64 bg-white rounded-[3.5rem] p-8 space-y-6 shadow-sm border border-slate-100">
                                <div className="flex gap-6 items-center">
                                    <div className="w-24 h-24 bg-gray-100 rounded-[2rem] animate-pulse" />
                                    <div className="space-y-3 flex-1">
                                        <div className="h-4 w-1/4 bg-gray-100 rounded-full animate-pulse" />
                                        <div className="h-8 w-3/4 bg-gray-100 rounded-full animate-pulse" />
                                        <div className="h-6 w-1/2 bg-gray-100 rounded-full animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Hero section for the page */}
                <div className="mb-16 space-y-4 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-ocean-100 text-ocean-600 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-fade-in">
                        <RocketLaunchIcon className="w-4 h-4" />
                        Explorez l'archipel
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none animate-slide-up">
                        Nos Lignes <br /> <span className="text-ocean-600">Maritimes</span>
                    </h1>
                    <p className="text-slate-500 text-lg max-w-xl font-medium animate-slide-up" style={{ animationDelay: '100ms' }}>
                        Découvrez toutes les destinations desservies par notre flotte.
                        Voyagez avec confort et sécurité sur nos liaisons régulières.
                    </p>
                </div>

                {/* Routes Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {routes.map((route, index) => (
                        <div
                            key={route.id}
                            className={`group relative bg-white rounded-[3.5rem] p-4 md:p-8 shadow-[0_40px_80px_rgba(0,0,0,0.03)] hover:shadow-[0_50px_100px_rgba(0,0,0,0.08)] border border-slate-100 hover:border-ocean-200 transition-all duration-700 animate-slide-up`}
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            <div className="flex flex-col md:flex-row md:items-center gap-8">
                                {/* Route Visualization */}
                                <div className="relative flex items-center justify-center p-8 bg-slate-50 rounded-[2.5rem] group-hover:bg-ocean-50/50 transition-colors duration-500 shrink-0 overflow-hidden">
                                    {/* Background decoration */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-ocean-100/30 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-ocean-200/40 transition-all"></div>

                                    <div className="relative z-10 flex flex-col items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-ocean-600 font-black text-xs">
                                            {route.departure_port.code}
                                        </div>
                                        <div className="h-12 w-px border-l-2 border-dashed border-ocean-200 relative">
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-ocean-600 rounded-full shadow-lg shadow-ocean-300 animate-pulse"></div>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-400 font-black text-xs">
                                            {route.arrival_port.code}
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 space-y-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2 text-ocean-600">
                                            <MapPinIcon className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Ligne Régulière</span>
                                        </div>
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-1">
                                            {route.departure_port.city}
                                        </h2>
                                        <p className="text-slate-300 font-black text-xl leading-none flex items-center gap-3">
                                            <ArrowRightIcon className="w-4 h-4 text-ocean-400 group-hover:translate-x-2 transition-transform duration-500" />
                                            <span className="group-hover:text-ocean-600 transition-colors">{route.arrival_port.city}</span>
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-50">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <ClockIcon className="w-4 h-4" />
                                            <span className="text-xs font-bold">{route.duration_minutes} minutes</span>
                                        </div>
                                        {route.distance_km && (
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <RocketLaunchIcon className="w-4 h-4" />
                                                <span className="text-xs font-bold">{route.distance_km} km</span>
                                            </div>
                                        )}
                                    </div>

                                    <Link
                                        to={`/reserver?route_id=${route.id}`}
                                        className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-ocean-600 hover:shadow-2xl hover:shadow-ocean-200 transition-all duration-300 active:scale-95"
                                    >
                                        Trouver un départ
                                        <ChevronRightIcon className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {routes.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[4rem] border shadow-sm space-y-6">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                            <MapPinIcon className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">Aucune ligne disponible</h3>
                        <p className="text-slate-500 max-w-xs mx-auto">Revenez plus tard pour voir nos nouvelles destinations.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
