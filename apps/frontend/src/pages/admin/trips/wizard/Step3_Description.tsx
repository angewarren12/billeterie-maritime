import { useState } from 'react';
import type { WizardData } from './CreateTripWizard';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface StepProps {
    data: WizardData;
    updateData: (updates: Partial<WizardData>) => void;
}

export default function Step3_Description({ data, updateData }: StepProps) {
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Limiter à 5 photos
        const currentImages = data.images || [];
        const newImages = [...currentImages, ...files].slice(0, 5);

        updateData({ images: newImages });

        // Create preview URLs
        const urls = newImages.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);
    };

    const removeImage = (index: number) => {
        const newImages = [...(data.images || [])];
        newImages.splice(index, 1);
        updateData({ images: newImages });

        const newUrls = [...previewUrls];
        newUrls.splice(index, 1);
        setPreviewUrls(newUrls);
    };

    return (
        <div className="space-y-12 animate-fadeIn p-4 lg:p-8">
            <div className="max-w-4xl space-y-12">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-ocean-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-ocean-500/20">
                        <PhotoIcon className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Description & Galerie</h3>
                        <p className="text-sm text-gray-500 font-medium">Ajoutez des visuels et des détails pour ce voyage</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-10">
                    {/* Description Area */}
                    <div className="space-y-4">
                        <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Description du voyage</label>
                        <textarea
                            rows={6}
                            className="block w-full rounded-[2rem] border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 p-8 text-gray-900 dark:text-white focus:ring-4 focus:ring-ocean-500/10 focus:border-ocean-500 outline-none transition-all font-medium text-lg shadow-sm"
                            placeholder="Décrivez l'expérience, les services à bord, ou toute information utile pour les passagers..."
                            value={data.description}
                            onChange={(e) => updateData({ description: e.target.value })}
                        />
                    </div>

                    {/* Image Upload Area */}
                    <div className="space-y-6">
                        <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Galerie Photos (Max 5)</label>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {/* Upload Button */}
                            <label className="relative aspect-square cursor-pointer group">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={handleImageChange}
                                />
                                <div className="h-full w-full rounded-[1.5rem] border-4 border-dashed border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 flex flex-col items-center justify-center gap-2 group-hover:border-ocean-500 group-hover:bg-ocean-50 dark:group-hover:bg-ocean-500/10 transition-all">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                        <PhotoIcon className="w-6 h-6 text-ocean-600" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-ocean-600">Ajouter</span>
                                </div>
                            </label>

                            {/* Previews */}
                            {previewUrls.map((url, index) => (
                                <div key={index} className="relative aspect-square rounded-[1.5rem] overflow-hidden group shadow-md bg-gray-100">
                                    <img src={url} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="p-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-colors shadow-xl"
                                        >
                                            <XMarkIcon className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Placeholders if empty */}
                            {Array.from({ length: Math.max(0, 4 - previewUrls.length) }).map((_, i) => (
                                <div key={`empty-${i}`} className="hidden md:block aspect-square rounded-[1.5rem] bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 opacity-50"></div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-ocean-50/50 dark:bg-ocean-900/10 rounded-[2.5rem] border border-ocean-100 dark:border-white/5">
                    <p className="text-sm text-ocean-800 dark:text-ocean-300 font-medium">
                        ✨ <span className="font-black">Astuce :</span> Les photos de haute qualité améliorent le taux de réservation de plus de 40%. Choisissez des clichés du navire en mer ou des aménagements intérieurs.
                    </p>
                </div>
            </div>
        </div>
    );
}
