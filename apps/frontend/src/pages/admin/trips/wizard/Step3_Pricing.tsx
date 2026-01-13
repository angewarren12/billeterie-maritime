import type { WizardData } from './CreateTripWizard';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface Step3Props {
    data: WizardData;
    updateData: (updates: Partial<WizardData>) => void;
}

export default function Step3_Pricing({ data, updateData }: Step3Props) {
    const handlePriceChange = (index: number, newPrice: number) => {
        const newCategories = [...data.pricing_settings.categories];
        newCategories[index].price = newPrice;
        updateData({
            pricing_settings: {
                ...data.pricing_settings,
                categories: newCategories
            }
        });
    };

    return (
        <div className="space-y-10 animate-fadeIn p-4 lg:p-8">
            <div className="max-w-4xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-ocean-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-ocean-500/20">
                        <CurrencyDollarIcon className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Configuration des Tarifs</h3>
                        <p className="text-sm text-gray-500 font-medium">Définissez les prix spécifiques pour ce voyage</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.pricing_settings.categories.map((category, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{category.name}</span>
                                <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${category.type === 'ADULT' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' : 'bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400'
                                    }`}>
                                    {category.type === 'ADULT' ? 'Adulte' : 'Enfant'}
                                </span>
                            </div>

                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    value={category.price}
                                    onChange={(e) => handlePriceChange(index, parseInt(e.target.value) || 0)}
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl py-5 px-6 text-2xl font-black focus:ring-4 focus:ring-ocean-500/10 focus:border-ocean-500 outline-none transition-all dark:text-white"
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-ocean-600 dark:text-ocean-400">FCFA</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/50">
                    <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                        💡 <span className="font-black">Rappel :</span> Ces tarifs sont spécifiques à l'instance du voyage que vous créez. Les tarifs par défaut des abonnements ne seront pas appliqués si vous les modifiez ici.
                    </p>
                </div>
            </div>
        </div>
    );
}
