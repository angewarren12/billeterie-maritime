import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../../services/api';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/solid';

export default function CreateTrip() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Data sources
    const [ships, setShips] = useState<any[]>([]);
    const [routes, setRoutes] = useState<any[]>([]);

    // Form Stats
    const [formData, setFormData] = useState({
        ship_id: '',
        route_id: '',
        departure_time: '',
        arrival_time: '',
        price_adult: 5000,
        price_child: 2500,
        status: 'scheduled',
        description: '',
        capacity: ''
    });

    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    useEffect(() => {
        // Load dependencies
        const loadResources = async () => {
            const [shipsData, routesData] = await Promise.all([
                apiService.getAdminShips(),
                apiService.getAdminRoutes()
            ]);
            setShips(shipsData.data);
            setRoutes(routesData.data);
        };
        loadResources();
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setImages(prev => [...prev, ...newFiles]);

            // Generate previews
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, (formData as any)[key]);
            });

            images.forEach((image, index) => {
                data.append(`images[${index}]`, image);
            });

            await apiService.createTrip(data);
            navigate('/admin/trips');
        } catch (error) {
            console.error("Failed to create trip", error);
            alert("Erreur lors de la création du voyage.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Planifier un nouveau voyage</h1>
                    <p className="text-gray-500 mt-2 font-medium">Configurez les détails techniques et tarifaires de la traversée</p>
                </div>
                <button
                    onClick={() => navigate('/admin/trips')}
                    className="flex items-center gap-2 text-gray-500 hover:text-ocean-600 transition-colors font-bold uppercase text-xs tracking-widest"
                >
                    <XMarkIcon className="w-5 h-5" />
                    Fermer sans enregistrer
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Form Main Area */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-gray-800/50 rounded-[2.5rem] border border-gray-200 dark:border-white/5 shadow-2xl overflow-hidden">
                        <div className="p-8 lg:p-12">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8 flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-ocean-500 rounded-full"></div>
                                Détails de la traversée
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Route & Bateau */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Route maritime</label>
                                    <select
                                        value={formData.route_id}
                                        onChange={e => setFormData({ ...formData, route_id: e.target.value })}
                                        required
                                        className="block w-full rounded-2xl border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 py-4 px-5 text-gray-900 dark:text-white focus:ring-2 focus:ring-ocean-500 transition-all outline-none font-bold"
                                    >
                                        <option value="">Sélectionner une route</option>
                                        {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Navire assigné</label>
                                    <select
                                        value={formData.ship_id}
                                        onChange={e => setFormData({ ...formData, ship_id: e.target.value })}
                                        required
                                        className="block w-full rounded-2xl border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 py-4 px-5 text-gray-900 dark:text-white focus:ring-2 focus:ring-ocean-500 transition-all outline-none font-bold"
                                    >
                                        <option value="">Sélectionner un navire</option>
                                        {ships.map(s => <option key={s.id} value={s.id}>{s.name} ({s.capacity_pax} places)</option>)}
                                    </select>
                                </div>

                                {/* Dates */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Date et heure de départ</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.departure_time}
                                        onChange={e => setFormData({ ...formData, departure_time: e.target.value })}
                                        required
                                        className="block w-full rounded-2xl border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 py-4 px-5 text-gray-900 dark:text-white focus:ring-2 focus:ring-ocean-500 transition-all outline-none font-bold"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Date et heure d'arrivée estimée</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.arrival_time}
                                        onChange={e => setFormData({ ...formData, arrival_time: e.target.value })}
                                        required
                                        className="block w-full rounded-2xl border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 py-4 px-5 text-gray-900 dark:text-white focus:ring-2 focus:ring-ocean-500 transition-all outline-none font-bold"
                                    />
                                </div>
                            </div>

                            <div className="mt-10 space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Description ou notes spéciales</label>
                                <textarea
                                    rows={4}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Informations complémentaires sur le voyage..."
                                    className="block w-full rounded-3xl border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 py-4 px-5 text-gray-900 dark:text-white focus:ring-2 focus:ring-ocean-500 transition-all outline-none font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800/50 rounded-[2.5rem] border border-gray-200 dark:border-white/5 shadow-2xl p-8 lg:p-12">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8 flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                            Galerie Photos
                        </h3>

                        <div className="relative group flex items-center justify-center rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-white/10 p-12 bg-gray-50/50 dark:bg-white/5 hover:bg-ocean-50 dark:hover:bg-ocean-500/5 transition-all cursor-pointer">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="text-center group-hover:scale-110 transition-transform duration-300">
                                <div className="p-5 bg-white dark:bg-gray-800 rounded-3xl shadow-xl inline-block mb-4">
                                    <PhotoIcon className="h-10 w-10 text-ocean-600" />
                                </div>
                                <p className="text-gray-900 dark:text-white font-black uppercase text-xs tracking-widest">Ajouter des photos</p>
                                <p className="text-gray-400 text-[10px] mt-2 font-bold uppercase tracking-tighter">PNG, JPG jusqu'à 2MB</p>
                            </div>
                        </div>

                        {previews.length > 0 && (
                            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
                                {previews.map((preview, index) => (
                                    <div key={index} className="relative group aspect-square">
                                        <img src={preview} alt="Preview" className="h-full w-full object-cover rounded-3xl shadow-lg ring-4 ring-white dark:ring-white/5" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-2xl p-2 shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                        >
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Summary */}
                <div className="space-y-8">
                    <div className="bg-gradient-to-br from-ocean-900 to-ocean-800 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>

                        <h3 className="text-xl font-black uppercase tracking-tight mb-8 relative z-10">Tarification</h3>

                        <div className="space-y-6 relative z-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-ocean-300">Tarif Adulte</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.price_adult}
                                        onChange={e => setFormData({ ...formData, price_adult: parseInt(e.target.value) })}
                                        className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 px-6 text-2xl font-black focus:ring-2 focus:ring-white/50 outline-none"
                                    />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-ocean-300">FCFA</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-ocean-300">Tarif Enfant</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.price_child}
                                        onChange={e => setFormData({ ...formData, price_child: parseInt(e.target.value) })}
                                        className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 px-6 text-2xl font-black focus:ring-2 focus:ring-white/50 outline-none"
                                    />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-ocean-300">FCFA</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-10 border-t border-white/10 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-ocean-300 uppercase">Capacité max.</span>
                                <span className="text-xl font-black uppercase">
                                    {ships.find(s => String(s.id) === String(formData.ship_id))?.capacity_pax || '--'} Places
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-ocean-600 hover:bg-ocean-500 text-white rounded-[2rem] py-8 px-6 font-black uppercase tracking-widest text-lg shadow-2xl shadow-ocean-600/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Traitement...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-4">
                                <span>Publier le voyage</span>
                                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                    →
                                </div>
                            </div>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
