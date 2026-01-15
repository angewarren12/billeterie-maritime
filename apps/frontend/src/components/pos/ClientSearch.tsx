import { useState } from 'react';
import { MagnifyingGlassIcon, UserPlusIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import type { User } from '../../services/api';
import { toast } from 'react-hot-toast';

interface ClientSearchProps {
    onClientSelected: (client: User | null) => void;
    onNewClient: () => void;
}

export default function ClientSearch({ onClientSelected, onNewClient }: ClientSearchProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedClient, setSelectedClient] = useState<User | null>(null);

    const handleSearch = async () => {
        if (searchQuery.length < 2) {
            toast.error('Veuillez entrer au moins 2 caractères');
            return;
        }

        setIsSearching(true);
        try {
            const results = await apiService.searchPosCustomers(searchQuery);
            setSearchResults(results);

            if (results.length === 0) {
                toast('Aucun client trouvé', { icon: '🔍' });
            }
        } catch (error) {
            console.error('Erreur recherche client:', error);
            toast.error('Erreur lors de la recherche');
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectClient = (client: User) => {
        setSelectedClient(client);
        onClientSelected(client);
        toast.success(`Client sélectionné : ${client.name}`);
    };

    const handleNewClient = () => {
        setSelectedClient(null);
        setSearchResults([]);
        setSearchQuery('');
        onClientSelected(null);
        onNewClient();
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 dark:text-white flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-cyan-500 rounded-full"></div>
                Identification Client
            </h2>

            {/* Barre de recherche */}
            <div className="flex gap-3 mb-6">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Nom, téléphone ou email du client..."
                        className="w-full bg-slate-50 dark:bg-slate-700/50 border-none rounded-2xl py-4 px-5 pl-12 text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500/20"
                    />
                    <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
                </div>
                <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-black rounded-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase text-xs tracking-widest shadow-lg shadow-cyan-600/20"
                >
                    {isSearching ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Recherche...
                        </div>
                    ) : (
                        <>🔍 Rechercher</>
                    )}
                </button>
            </div>

            {/* Client sélectionné */}
            {selectedClient && (
                <div className="mb-6 p-5 bg-cyan-50 dark:bg-cyan-900/20 border-2 border-cyan-500 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-cyan-600 flex items-center justify-center text-white font-black text-xl">
                                {selectedClient.name.charAt(0)}
                            </div>
                            <div>
                                <div className="font-black text-slate-900 dark:text-white text-lg">
                                    {selectedClient.name}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    {selectedClient.phone} • {selectedClient.email}
                                </div>
                            </div>
                        </div>
                        <CheckCircleIcon className="w-8 h-8 text-cyan-600" />
                    </div>
                </div>
            )}

            {/* Résultats de recherche */}
            {searchResults.length > 0 && !selectedClient && (
                <div className="space-y-3 mb-6">
                    <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        {searchResults.length} résultat(s) trouvé(s)
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
                        {searchResults.map((client) => (
                            <button
                                key={client.id}
                                onClick={() => handleSelectClient(client)}
                                className="w-full p-4 bg-slate-50 dark:bg-slate-700/30 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 border border-slate-200 dark:border-slate-700 hover:border-cyan-500 rounded-2xl transition-all text-left group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-600 group-hover:bg-cyan-600 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:text-white font-black transition-colors">
                                        {client.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-black text-slate-900 dark:text-white">
                                            {client.name}
                                        </div>
                                        <div className="text-xs text-slate-600 dark:text-slate-400">
                                            {client.phone} • {client.email}
                                        </div>
                                    </div>
                                    <div className="text-xs font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                        Sélectionner →
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Bouton Nouveau Client */}
            <button
                onClick={handleNewClient}
                className="w-full p-5 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-cyan-500 rounded-2xl text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 font-black uppercase tracking-widest text-xs transition-all hover:bg-cyan-50/50 dark:hover:bg-cyan-900/10 flex items-center justify-center gap-3"
            >
                <UserPlusIcon className="w-5 h-5" />
                + Nouveau Client
            </button>
        </div>
    );
}
