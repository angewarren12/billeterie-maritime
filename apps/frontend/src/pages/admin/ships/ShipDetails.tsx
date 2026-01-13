import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, LifebuoyIcon } from '@heroicons/react/24/outline';
import type { Ship } from '../../../services/api';

interface ShipDetailsProps {
    ship: Ship | null;
    open: boolean;
    onClose: () => void;
}

export default function ShipDetails({ ship, open, onClose }: ShipDetailsProps) {
    if (!ship) return null;

    const shipImage = ship.images && ship.images.length > 0
        ? (ship.images[0].startsWith('http') ? ship.images[0] : `${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${ship.images[0]}`)
        : null;

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-4xl border border-gray-200 dark:border-gray-700">
                                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block z-10">
                                    <button
                                        type="button"
                                        className="rounded-full bg-white/10 p-2 text-gray-400 hover:text-gray-500 focus:outline-none backdrop-blur-md hover:bg-white/20 transition"
                                        onClick={onClose}
                                    >
                                        <span className="sr-only">Fermer</span>
                                        <XMarkIcon className="h-6 w-6 text-white drop-shadow-md" aria-hidden="true" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2">
                                    {/* Image Section */}
                                    <div className="relative h-64 lg:h-auto bg-gray-100 dark:bg-gray-900 overflow-hidden">
                                        {shipImage ? (
                                            <img
                                                src={shipImage}
                                                alt={ship.name}
                                                className="absolute inset-0 h-full w-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x800?text=Navire';
                                                }}
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <LifebuoyIcon className="h-24 w-24 text-gray-300 dark:text-gray-600" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent lg:bg-gradient-to-r" />
                                        <div className="absolute bottom-4 left-4 text-white">
                                            <h3 className="text-3xl font-bold">{ship.name}</h3>
                                            <p className="text-gray-300">{ship.company}</p>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-6 sm:p-10 bg-white dark:bg-gray-800">
                                        <div className="flex items-center justify-between mb-6">
                                            <span className="inline-flex items-center rounded-full bg-ocean-100 dark:bg-ocean-900/30 px-3 py-1 text-sm font-medium text-ocean-800 dark:text-ocean-400">
                                                {ship.type}
                                            </span>
                                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${ship.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 text-red-400'}`}>
                                                {ship.is_active ? 'En Service' : 'Maintenance'}
                                            </span>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Capacités & Technique</h4>
                                                <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 text-center">
                                                    <dt className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Capacité Passagers</dt>
                                                    <dd className="text-4xl font-black text-ocean-600 dark:text-ocean-400 tracking-tight">{ship.capacity_pax}</dd>
                                                    <p className="mt-2 text-xs text-gray-500 italic">Nombre maximal de personnes autorisées à bord.</p>
                                                </div>
                                            </div>

                                            {ship.description && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">À propos</h4>
                                                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                                        {ship.description}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Gallery Preview (if multiple images) */}
                                            {ship.images && ship.images.length > 1 && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Galerie</h4>
                                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                                        {ship.images.slice(1).map((img, idx) => (
                                                            <img
                                                                key={idx}
                                                                src={img.startsWith('http') ? img : `${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${img}`}
                                                                alt={`Gallery ${idx}`}
                                                                className="h-16 w-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 transition"
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
