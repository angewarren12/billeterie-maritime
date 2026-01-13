import type { WizardData } from './CreateTripWizard';
import { Switch } from '@headlessui/react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';

interface Step2Props {
    data: WizardData;
    updateData: (updates: Partial<WizardData>) => void;
}

const DAYS = [
    { value: 'monday', label: 'Lundi' },
    { value: 'tuesday', label: 'Mardi' },
    { value: 'wednesday', label: 'Mercredi' },
    { value: 'thursday', label: 'Jeudi' },
    { value: 'friday', label: 'Vendredi' },
    { value: 'saturday', label: 'Samedi' },
    { value: 'sunday', label: 'Dimanche' },
];

export default function Step2_Schedule({ data, updateData }: Step2Props) {
    // Auto-select days based on date range
    useEffect(() => {
        if (data.is_recurring && data.start_date && data.end_date) {
            const start = new Date(data.start_date);
            const end = new Date(data.end_date);
            const daysInRange = new Set<string>();

            let current = new Date(start);
            while (current <= end) {
                const dayName = current.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                daysInRange.add(dayName);
                current.setDate(current.getDate() + 1);
            }

            // Auto-select only if no days are currently selected
            if (data.recurrence_days.length === 0) {
                updateData({ recurrence_days: Array.from(daysInRange) });
            }
        }
    }, [data.start_date, data.end_date, data.is_recurring]);

    const handleDayToggle = (day: string) => {
        const currentDays = data.recurrence_days;
        const newDays = currentDays.includes(day)
            ? currentDays.filter(d => d !== day)
            : [...currentDays, day];
        updateData({ recurrence_days: newDays });
    };

    const selectAllDaysInRange = () => {
        if (data.start_date && data.end_date) {
            const start = new Date(data.start_date);
            const end = new Date(data.end_date);
            const daysInRange = new Set<string>();

            let current = new Date(start);
            while (current <= end) {
                const dayName = current.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                daysInRange.add(dayName);
                current.setDate(current.getDate() + 1);
            }

            updateData({ recurrence_days: Array.from(daysInRange) });
        }
    };

    const calculateDayCount = () => {
        if (data.start_date && data.end_date) {
            const start = new Date(data.start_date);
            const end = new Date(data.end_date);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            return diffDays;
        }
        return 0;
    };

    const addTime = () => {
        updateData({ times: [...data.times, '08:00'] });
    };

    const updateTime = (index: number, value: string) => {
        const newTimes = [...data.times];
        newTimes[index] = value;
        updateData({ times: newTimes });
    };

    const removeTime = (index: number) => {
        updateData({ times: data.times.filter((_, i) => i !== index) });
    };

    return (
        <div className="space-y-12 animate-fadeIn p-4 lg:p-8">
            <div className="max-w-4xl">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-ocean-500 rounded-full"></div>
                    Configuration du Planning
                </h3>

                {/* Round Trip Toggle */}
                <div className="flex items-center justify-between p-8 bg-ocean-50/50 dark:bg-ocean-900/10 rounded-[2rem] mb-8 border border-ocean-100 dark:border-white/5 shadow-sm">
                    <div>
                        <span className="block text-lg font-black text-gray-900 dark:text-white tracking-tight">Générer également le trajet retour</span>
                        <span className="text-sm text-gray-500 font-medium">Crée automatiquement les voyages en sens inverse (Ex: Gorée → Dakar)</span>
                    </div>
                    <Switch
                        checked={data.create_return_trip}
                        onChange={(checked: boolean) => updateData({ create_return_trip: checked })}
                        className={`${data.create_return_trip ? 'bg-ocean-600' : 'bg-gray-200 dark:bg-gray-700'
                            } relative inline-flex h-8 w-14 items-center rounded-full transition-all focus:outline-none focus:ring-4 focus:ring-ocean-500/20`}
                    >
                        <span
                            className={`${data.create_return_trip ? 'translate-x-7' : 'translate-x-1'
                                } inline-block h-6 w-6 transform rounded-full bg-white shadow-xl transition-transform`}
                        />
                    </Switch>
                </div>

                <div className="h-px bg-gray-100 dark:bg-white/5 my-10" />

                <div className="flex items-center justify-between p-8 bg-gray-50/50 dark:bg-white/5 rounded-[2rem] mb-10 border border-gray-100 dark:border-white/5 shadow-sm">
                    <div>
                        <span className="block text-lg font-black text-gray-900 dark:text-white tracking-tight">Mode Récurrent</span>
                        <span className="text-sm text-gray-500 font-medium">Créer plusieurs voyages automatiquement selon un planning</span>
                    </div>
                    <Switch
                        checked={data.is_recurring}
                        onChange={(checked: boolean) => updateData({ is_recurring: checked })}
                        className={`${data.is_recurring ? 'bg-ocean-600' : 'bg-gray-200 dark:bg-gray-700'
                            } relative inline-flex h-8 w-14 items-center rounded-full transition-all focus:outline-none focus:ring-4 focus:ring-ocean-500/20`}
                    >
                        <span
                            className={`${data.is_recurring ? 'translate-x-7' : 'translate-x-1'
                                } inline-block h-6 w-6 transform rounded-full bg-white shadow-xl transition-transform`}
                        />
                    </Switch>
                </div>

                {!data.is_recurring ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white dark:bg-gray-900/50 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Date de départ</label>
                            <input
                                type="date"
                                className="block w-full rounded-2xl border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 py-4 px-6 text-gray-900 dark:text-white focus:ring-2 focus:ring-ocean-500 transition-all outline-none font-bold text-lg"
                                value={data.single_date || ''}
                                onChange={(e) => updateData({ single_date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Heure de départ</label>
                            <input
                                type="time"
                                className="block w-full rounded-2xl border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 py-4 px-6 text-gray-900 dark:text-white focus:ring-2 focus:ring-ocean-500 transition-all outline-none font-bold text-lg"
                                value={data.single_time || ''}
                                onChange={(e) => updateData({ single_time: e.target.value })}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {/* Date Range */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white dark:bg-gray-900/50 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Date de début</label>
                                <input
                                    type="date"
                                    className="block w-full rounded-2xl border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 py-4 px-6 text-gray-900 dark:text-white focus:ring-2 focus:ring-ocean-500 transition-all outline-none font-bold text-lg"
                                    value={data.start_date || ''}
                                    onChange={(e) => updateData({ start_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Date de fin</label>
                                <input
                                    type="date"
                                    className="block w-full rounded-2xl border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 py-4 px-6 text-gray-900 dark:text-white focus:ring-2 focus:ring-ocean-500 transition-all outline-none font-bold text-lg"
                                    value={data.end_date || ''}
                                    onChange={(e) => updateData({ end_date: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Days Selection */}
                        <div className="bg-white dark:bg-gray-900/50 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                                    Jours de la semaine à inclure
                                </label>
                                {data.start_date && data.end_date && (
                                    <button
                                        type="button"
                                        onClick={selectAllDaysInRange}
                                        className="text-xs bg-ocean-50 text-ocean-600 dark:bg-ocean-500/10 dark:text-ocean-400 px-4 py-2 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-sm"
                                    >
                                        ✓ Tous les jours de la période
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {DAYS.map((day) => (
                                    <button
                                        key={day.value}
                                        type="button"
                                        onClick={() => handleDayToggle(day.value)}
                                        className={`px-8 py-4 rounded-2xl text-sm font-black transition-all duration-300 ${data.recurrence_days.includes(day.value)
                                            ? 'bg-ocean-600 text-white shadow-xl shadow-ocean-500/30 scale-105'
                                            : 'bg-gray-50 dark:bg-white/5 text-gray-500 hover:bg-ocean-50 dark:hover:bg-ocean-500/10 hover:text-ocean-600'
                                            }`}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>

                            {data.start_date && data.end_date && data.recurrence_days.length > 0 && (
                                <div className="mt-8 flex items-center gap-3 bg-green-50/50 dark:bg-green-500/10 p-5 rounded-2xl border border-green-100 dark:border-green-500/10">
                                    <div className="w-8 h-8 rounded-xl bg-green-500 text-white flex items-center justify-center text-lg">✓</div>
                                    <p className="text-sm font-bold text-green-700 dark:text-green-400">
                                        Planning configuré : <span className="text-green-900 dark:text-green-200">{calculateDayCount()} jours</span> au total sur cette période.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Times Selection */}
                        <div className="bg-white dark:bg-gray-900/50 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl">
                            <label className="block text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Heures de départ</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {data.times.map((time, index) => (
                                    <div key={index} className="flex items-center gap-3 group">
                                        <input
                                            type="time"
                                            value={time}
                                            onChange={(e) => updateTime(index, e.target.value)}
                                            className="block w-full rounded-2xl border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 py-4 px-6 text-gray-900 dark:text-white focus:ring-2 focus:ring-ocean-500 transition-all outline-none font-black text-xl shadow-sm"
                                        />
                                        {data.times.length > 1 && (
                                            <button
                                                onClick={() => removeTime(index)}
                                                className="p-3 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <TrashIcon className="h-6 w-6" />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                <button
                                    onClick={addTime}
                                    className="flex items-center justify-center gap-4 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl py-4 px-6 text-ocean-600 font-black uppercase text-xs tracking-widest hover:bg-ocean-50 dark:hover:bg-ocean-500/10 transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-xl bg-ocean-100 dark:bg-ocean-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <PlusIcon className="h-5 w-5" />
                                    </div>
                                    Ajouter un horaire
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
