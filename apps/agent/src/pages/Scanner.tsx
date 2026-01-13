import React, { useState, useEffect, useRef } from 'react';
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
    ArrowPathIcon,
    IdentificationIcon,
} from '@heroicons/react/24/solid';
import Header from '../components/Header';

const Scanner = () => {
    const { tripId } = useParams<{ tripId: string }>();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [scanResult, setScanResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    // Pour le support Famaco (Keyboard Emulation/Manual Input)
    const [manualCode, setManualCode] = useState("");

    useEffect(() => {
        loadStats();

        // Initialisation du scanner caméra
        scannerRef.current = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );
        scannerRef.current.render(onScanSuccess, onScanFailure);

        // Listener global pour le scanner matériel (Keyboard mode)
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                if (manualCode.trim()) {
                    onScanSuccess(manualCode.trim());
                    setManualCode("");
                }
            } else if (e.key.length === 1) {
                setManualCode(prev => prev + e.key);
                // Reset manual code after a timeout to prevent garbage
                setTimeout(() => setManualCode(""), 2000);
            }
        };

        window.addEventListener('keypress', handleKeyPress);

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
            }
            window.removeEventListener('keypress', handleKeyPress);
        };
    }, [manualCode]);

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

        // Haptic feedback (if supported)
        if (window.navigator.vibrate) {
            window.navigator.vibrate(100);
        }

        try {
            const response = await agentService.validateTicket({
                ticket_code: decodedText,
                trip_id: tripId!
            });

            const newResult = {
                success: true,
                message: response.message,
                passenger: response.passenger,
                badge_info: response.badge_info,
                time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            };

            setScanResult(newResult);
            setHistory(prev => [newResult, ...prev].slice(0, 5));
            loadStats();
        } catch (error: any) {
            if (!navigator.onLine || error.code === 'ERR_NETWORK') {
                offlineService.addToQueue({
                    ticket_code: decodedText,
                    trip_id: tripId!
                });
                const offlineResult = {
                    success: true,
                    message: "Scan enregistré (Hors-ligne)",
                    isOffline: true,
                    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                };
                setScanResult(offlineResult);
                setHistory(prev => [offlineResult, ...prev].slice(0, 5));
            } else {
                const failResult = {
                    success: false,
                    message: error.response?.data?.message || "Billet ou Badge invalide",
                    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                };
                setScanResult(failResult);
                setHistory(prev => [failResult, ...prev].slice(0, 5));
                if (window.navigator.vibrate) {
                    window.navigator.vibrate([100, 50, 100]);
                }
            }
        } finally {
            setLoading(false);
            setTimeout(() => setScanResult(null), 4000);
        }
    };

    const onScanFailure = (error: any) => { };

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col">
            <Header title="Contrôle d'Accès" subtitle={`Voyage #${tripId?.slice(0, 8).toUpperCase()}`} />

            <div className="px-6 py-2 flex justify-between items-center">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-white transition-colors uppercase tracking-[0.2em]"
                >
                    <ChevronLeftIcon className="w-4 h-4" />
                    Retour
                </button>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${navigator.onLine ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                        {navigator.onLine ? 'En Ligne' : 'Hors-Ligne'}
                    </span>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-ocean-950/30 border-y border-white/5 p-4 grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center">
                    <span className="text-[8px] font-black text-ocean-400 uppercase tracking-[0.2em] mb-1">Embarqués</span>
                    <p className="text-3xl font-black">{stats?.boarding_count || 0}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center">
                    <span className="text-[8px] font-black text-orange-400 uppercase tracking-[0.2em] mb-1">Restants</span>
                    <p className="text-3xl font-black">{stats?.total_passengers ? stats.total_passengers - (stats.boarding_count || 0) : '--'}</p>
                </div>
            </div>

            {/* Scanner History Toggle (Small View) */}
            <div className="flex-1 relative flex flex-col p-6 overflow-hidden">
                <div id="reader" className="w-full max-w-sm mx-auto rounded-3xl overflow-hidden border-2 border-ocean-500/20 bg-black shadow-inner"></div>

                {/* Last Scans History */}
                <div className="mt-8 space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Derniers Passages</h4>
                    {history.length === 0 ? (
                        <p className="text-center py-8 text-gray-600 text-xs font-bold italic">Aucun scan récent</p>
                    ) : (
                        history.map((h, i) => (
                            <div key={i} className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${h.success ? 'bg-white/5 border-white/5' : 'bg-red-500/10 border-red-500/20'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${h.success ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                        {h.success ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-tight truncate max-w-[150px]">
                                            {h.badge_info ? h.badge_info.owner_name : h.passenger?.name || h.message}
                                        </p>
                                        <p className="text-[9px] text-gray-500 font-bold uppercase">
                                            {h.badge_info ? `Badge: ${h.badge_info.plan_name}` : 'Billet Individuel'}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-mono text-gray-500 font-bold">{h.time}</span>
                            </div>
                        ))
                    )}
                </div>

                {/* Result Overlay */}
                {scanResult && (
                    <div className={`fixed inset-x-6 bottom-24 z-50 p-8 rounded-[2.5rem] border-2 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-bottom-10 duration-500 ${scanResult.success ? 'bg-green-600/95 border-green-400' : 'bg-red-600/95 border-red-400'}`}>
                        <div className="flex flex-col items-center text-center gap-4">
                            {scanResult.success ? (
                                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-2">
                                    <CheckCircleIcon className="w-12 h-12 text-white" />
                                </div>
                            ) : (
                                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-2">
                                    <XCircleIcon className="w-12 h-12 text-white" />
                                </div>
                            )}

                            <div className="space-y-1">
                                <h3 className="text-3xl font-black text-white tracking-tighter uppercase">{scanResult.success ? 'ACCÈS AUTORISÉ' : 'ACCÈS REFUSÉ'}</h3>
                                <p className="text-white font-bold opacity-90">{scanResult.message}</p>
                            </div>

                            {scanResult.badge_info && (
                                <div className="w-full mt-4 p-4 bg-black/20 rounded-2xl border border-white/10 space-y-3">
                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                        <span className="text-[10px] font-black text-white/50 uppercase tracking-widest text-left">Abonné</span>
                                        <span className="text-sm font-black text-white text-right">{scanResult.badge_info.owner_name}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                        <span className="text-[10px] font-black text-white/50 uppercase tracking-widest text-left">Plan</span>
                                        <span className="text-sm font-black text-white text-right">{scanResult.badge_info.plan_name}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/10 p-2 rounded-xl">
                                        <span className="text-[10px] font-black text-white px-2 py-1 bg-white/10 rounded uppercase tracking-widest">Solde Restant</span>
                                        <span className={`text-xl font-black ${typeof scanResult.badge_info.credits_remaining === 'number' && scanResult.badge_info.credits_remaining < 3 ? 'text-orange-400' : 'text-white'}`}>
                                            {scanResult.badge_info.credits_remaining}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {scanResult.passenger && !scanResult.badge_info && (
                                <div className="flex items-center gap-2 mt-2 bg-black/20 px-4 py-2 rounded-full border border-white/10">
                                    <UserIcon className="w-4 h-4 text-white/60" />
                                    <span className="text-xs font-black text-white uppercase tracking-widest">{scanResult.passenger.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Manual Entry or Hardware Trigger Info */}
            <div className="p-6 bg-gray-950 border-t border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-center gap-4 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] animate-pulse">
                    <ArrowPathIcon className="w-3.5 h-3.5" />
                    Lecture continue active
                </div>
                <button className="w-full py-5 bg-white/5 border border-white/10 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center justify-center gap-3">
                    <IdentificationIcon className="w-5 h-5 text-ocean-500" />
                    Saisie Manuelle (Clavier)
                </button>
            </div>
        </div>
    );
};

export default Scanner;
