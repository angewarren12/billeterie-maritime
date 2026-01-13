import type { WizardData } from './CreateTripWizard';
import { CalendarIcon, MapIcon, CurrencyDollarIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface Step4Props {
    data: WizardData;
}

export default function Step4_Review({ data }: Step4Props) {
    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Récapitulatif avant création</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* General Info */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-ocean-50 dark:bg-ocean-900/20 rounded-bl-full -mr-4 -mt-4" />

                        <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-4">
                            <MapIcon className="w-5 h-5 text-ocean-600" />
                            Trajet & Navire
                        </h4>

                        <dl className="space-y-3">
                            <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Ligne</dt>
                                <dd className="text-sm font-medium text-gray-900 dark:text-white">{data.route_id === '1' ? 'Dakar - Ziguinchor' : 'Dakar - Gorée'}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Navire ID</dt>
                                <dd className="text-sm font-medium text-gray-900 dark:text-white">{data.ship_id}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Schedule */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-bl-full -mr-4 -mt-4" />

                        <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-4">
                            <CalendarIcon className="w-5 h-5 text-green-600" />
                            Planning
                        </h4>

                        <dl className="space-y-3">
                            <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Mode</dt>
                                <dd className="text-sm font-medium text-gray-900 dark:text-white">
                                    {data.is_recurring ? 'Récurrent' : 'Unique'}
                                </dd>
                            </div>

                            {data.is_recurring ? (
                                <>
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-gray-500">Période</dt>
                                        <dd className="text-sm font-medium text-gray-900 dark:text-white">
                                            {data.start_date} au {data.end_date}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500 mb-1">Jours</dt>
                                        <dd className="flex flex-wrap gap-1">
                                            {data.recurrence_days.map(d => (
                                                <span key={d} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                                    {d}
                                                </span>
                                            ))}
                                        </dd>
                                    </div>
                                </>
                            ) : (
                                <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500">Date</dt>
                                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                                        {data.single_date} à {data.single_time}
                                    </dd>
                                </div>
                            )}

                            <div>
                                <dt className="text-sm text-gray-500 mb-1">Horaires quotidiens</dt>
                                <dd className="flex flex-wrap gap-2">
                                    {data.times.map(t => (
                                        <span key={t} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                                            {t}
                                        </span>
                                    ))}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Pricing */}
                    <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 dark:bg-purple-900/20 rounded-bl-full -mr-4 -mt-4" />

                        <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-4">
                            <CurrencyDollarIcon className="w-5 h-5 text-purple-600" />
                            Grille Tarifaire du Voyage
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {data.pricing_settings.categories.map((cat, idx) => (
                                <div key={idx} className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                                        {cat.name}
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <span className="text-lg font-bold text-gray-900 dark:text-white">{cat.price.toLocaleString()} F</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${cat.type === 'ADULT' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                            {cat.type === 'ADULT' ? 'ADULTE' : 'ENFANT'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Description & Photos */}
                    <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-4">
                            <PhotoIcon className="w-5 h-5 text-ocean-600" />
                            Description & Photos
                        </h4>

                        <div className="space-y-4">
                            {data.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl italic">
                                    "{data.description}"
                                </p>
                            )}

                            {data.images && data.images.length > 0 && (
                                <div className="flex gap-4 overflow-x-auto pb-2">
                                    {data.images.map((file, idx) => (
                                        <div key={idx} className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!data.description && (!data.images || data.images.length === 0) && (
                                <p className="text-sm text-gray-400 italic">Aucune description ou photo ajoutée.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
