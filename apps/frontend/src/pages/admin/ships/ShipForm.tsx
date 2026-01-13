import { useState, useEffect } from 'react';
import { apiService, type Ship } from '../../../services/api';
import { PhotoIcon } from '@heroicons/react/24/solid';

interface ShipFormProps {
    ship?: Ship | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ShipForm({ ship, onSuccess, onCancel }: ShipFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        type: 'ferry', // ferry, speed_boat, etc.
        capacity_pax: 0,
        is_active: true,
        description: ''
    });

    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (ship) {
            setFormData({
                name: ship.name,
                company: ship.company,
                type: ship.type,
                capacity_pax: ship.capacity_pax,
                is_active: ship.is_active,
                description: ship.description || ''
            });

            // Load existing images if any (mocking preview for now or handling URL)
            if (ship.images && ship.images.length > 0) {
                const existingPreviews = ship.images.map(img =>
                    `${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${img}`
                );
                setPreviews(existingPreviews);
            }
        }
    }, [ship]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setImages(prev => [...prev, ...newFiles]);

            // Generate previews
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, (formData as any)[key] === true ? '1' : (formData as any)[key] === false ? '0' : (formData as any)[key]);
            });

            images.forEach((image, index) => {
                data.append(`images[${index}]`, image);
            });

            if (ship) {
                await apiService.updateShip(ship.id, data);
            } else {
                await apiService.createShip(data);
            }
            onSuccess();
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                        {ship ? 'Modifier le navire' : 'Nouveau navire'}
                    </h3>

                    {error && (
                        <div className="mt-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
                        </div>
                    )}

                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        {/* Name */}
                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom du navire</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm p-2 border"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        {/* Company */}
                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Compagnie</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm p-2 border"
                                value={formData.company}
                                onChange={e => setFormData({ ...formData, company: e.target.value })}
                            />
                        </div>

                        {/* Type */}
                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm p-2 border"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="ferry">Ferry</option>
                                <option value="speed_boat">Speed Boat</option>
                                <option value="chaloupe">Chaloupe</option>
                                <option value="cargo">Cargo</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm p-2 border"
                                value={formData.is_active ? 'true' : 'false'}
                                onChange={e => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                            >
                                <option value="true">Actif</option>
                                <option value="false">Maintenance / Inactif</option>
                            </select>
                        </div>

                        {/* Capacities */}
                        <div className="sm:col-span-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Capacité Passagers (Pax)</label>
                            <input
                                type="number"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm p-2 border"
                                value={formData.capacity_pax}
                                onChange={e => setFormData({ ...formData, capacity_pax: parseInt(e.target.value) })}
                            />
                        </div>

                        {/* Description */}
                        <div className="sm:col-span-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                            <textarea
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm p-2 border"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="sm:col-span-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Photos</label>
                            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 dark:border-gray-600 px-6 py-10 bg-gray-50 dark:bg-gray-900/20 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer relative">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="text-center pointer-events-none">
                                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                                    <div className="mt-4 flex text-sm leading-6 text-gray-600 dark:text-gray-400 justify-center">
                                        <span className="relative rounded-md font-semibold text-ocean-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-ocean-600 focus-within:ring-offset-2 hover:text-ocean-500">
                                            <span>Télécharger des fichiers</span>
                                        </span>
                                    </div>
                                    <p className="text-xs leading-5 text-gray-500 dark:text-gray-500">PNG, JPG jusqu'à 2MB</p>
                                </div>
                            </div>

                            {/* Previews */}
                            {previews.length > 0 && (
                                <div className="mt-4 grid grid-cols-4 gap-4">
                                    {previews.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <img src={preview} alt="Preview" className="h-20 w-full object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                                            {/* We only allow removing if it's the last added for simplicity in this version, or we just rely on clearing all if reset. 
                                                Real implementation requires more complex state management for mixed local/remote images. */}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse mt-6 -mx-6 -mb-4 rounded-b-lg">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-ocean-600 text-base font-medium text-white hover:bg-ocean-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ocean-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ocean-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={onCancel}
                >
                    Annuler
                </button>
            </div>
        </form>
    );
}
