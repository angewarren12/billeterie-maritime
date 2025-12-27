import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { agentService } from '../services/agentApi';
import { offlineService } from '../services/OfflineService';
import {
    ChevronLeftIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    UserIcon,
    BoltIcon,
} from '@heroicons/react/24/solid';
import Header from '../components/Header';

const Scanner = () => {
    const { tripId } = useParams<{ tripId: string }>();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [scanResult, setScanResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadStats();

        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanFailure);

        return () => {
            scanner.clear().catch(error => {
                console.error("Failed to clear scanner", error);
            });
        };
    }, []);

    const loadStats = async () => {
        try {
            const data = await agentService.getTripStats(tripId!);
            setStats(data);
        } catch (error) {
            console.error("Failed to load stats", error);
        }
    };

    const onScanSuccess = async (decodedText: string) => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await agentService.validateTicket({
                ticket_code: decodedText,
                trip_id: tripId!
            });
            setScanResult({
                success: true,
                message: response.message,
                passenger: response.passenger
            });
            loadStats();
        } catch (error: any) {
            // Gérer le mode hors-ligne
            if (!navigator.onLine || error.code === 'ERR_NETWORK') {
                const queued = offlineService.addToQueue({
                    ticket_code: decodedText,
                    trip_id: tripId!
                });
                setScanResult({
                    success: true,
                    message: "Scan enregistré (Hors-ligne)",
                    isOffline: true
                });
            } else {
                setScanResult({
                    success: false,
                    message: error.response?.data?.message || "Billet invalide"
                });
            }
        } finally {
            setLoading(false);
            // Fermer le résultat après 3 secondes
            setTimeout(() => setScanResult(null), 3000);
        }
    };

    const onScanFailure = (error: any) => {
        // Trop verbeux pour les logs
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col">
            <Header title="Scanner" subtitle={`Voyage #${tripId?.slice(0, 8)}`} />

            {/* Back Button Floating */}
            <div className="px-6 py-4">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest"
                >
                    <ChevronLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    Retour aux Traversées
                </button>
            </div>

            {/* Stats Bar */}
            <div className="bg-ocean-950 p-6 grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                        <UserIcon className="w-3.5 h-3.5 text-ocean-500" />
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Embarqués</span>
                    </div>
                    <p className="text-2xl font-black">{stats?.boarding_count || 0}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                        <BoltIcon className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Restants</span>
                    </div>
                    <p className="text-2xl font-black">{stats?.total_passengers ? stats.total_passengers - (stats.boarding_count || 0) : '--'}</p>
                </div>
            </div>

            {/* Main Scanner Section */}
            <div className="flex-1 relative flex flex-col items-center justify-center p-6 pb-24">
                <div id="reader" className="w-full max-w-sm rounded-3xl overflow-hidden border-2 border-ocean-500/30 shadow-2xl shadow-ocean-500/10"></div>

                <p className="mt-8 text-sm text-gray-400 font-medium text-center">Positionnez le QR Code dans le cadre.</p>

                {/* Result Overlay */}
                {scanResult && (
                    <div className={`fixed inset-x-6 top-24 z-50 p-6 rounded-[2rem] border-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-300 ${scanResult.success ? 'bg-green-500/90 border-green-400/50' : 'bg-red-500/90 border-red-400/50'}`}>
                        <div className="flex items-center gap-4">
                            {scanResult.success ? (
                                <CheckCircleIcon className="w-12 h-12 text-white" />
                            ) : (
                                <XCircleIcon className="w-12 h-12 text-white" />
                            )}
                            <div>
                                <h3 className="text-lg font-black text-white leading-tight">{scanResult.success ? 'VALIDÉ !' : 'ERREUR'}</h3>
                                <p className="text-white/80 text-sm font-bold">{scanResult.message}</p>
                                {scanResult.passenger && (
                                    <p className="text-white/70 text-xs mt-1 uppercase tracking-widest font-black">
                                        Client: {scanResult.passenger.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Manual Entry Mock */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gray-900/80 backdrop-blur-md border-t border-white/5">
                <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-all flex items-center justify-center gap-3">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    Saisie Manuelle de Code
                </button>
            </div>
        </div>
    );
};

export default Scanner;
