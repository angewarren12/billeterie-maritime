import { useState, useEffect } from 'react';
import { apiService, type Port } from '../../../services/api';

interface PortFormProps {
    port?: Port | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function PortForm({ port, onSuccess, onCancel }: PortFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        city: '',
        country: 'Sénégal' // Default
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (port) {
            setFormData({
                name: port.name,
                code: port.code,
                city: port.city,
                country: port.country
            });
        }
    }, [port]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (port) {
                await apiService.updatePort(port.id, formData);
            } else {
                await apiService.createPort(formData);
            }
            onSuccess();
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Une erreur est survenue lors de l'enregistrement.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                        {port ? 'Modifier la gare' : 'Nouvelle gare maritime'}
                    </h3>
                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        {error && (
                            <div className="sm:col-span-6 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="sm:col-span-3">
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Code (ex: DKR)
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="code"
                                    id="code"
                                    required
                                    maxLength={5}
                                    className="shadow-sm focus:ring-ocean-500 focus:border-ocean-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2 border"
                                    value={formData.code}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Ville
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="city"
                                    id="city"
                                    required
                                    className="shadow-sm focus:ring-ocean-500 focus:border-ocean-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2 border"
                                    value={formData.city}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Nom de la gare
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    required
                                    placeholder="ex: Gare Maritime de Dakar"
                                    className="shadow-sm focus:ring-ocean-500 focus:border-ocean-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2 border"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Pays
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="country"
                                    id="country"
                                    required
                                    className="shadow-sm focus:ring-ocean-500 focus:border-ocean-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2 border"
                                    value={formData.country}
                                    onChange={handleChange}
                                />
                            </div>
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
