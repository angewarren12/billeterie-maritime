import api from './agentApi';

export interface QueuedScan {
    id: string;
    ticket_code: string;
    trip_id: string;
    timestamp: string;
    status: 'pending' | 'syncing' | 'error';
}

class OfflineService {
    private storageKey = 'offline_scans_queue';

    getQueue(): QueuedScan[] {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    addToQueue(scan: Omit<QueuedScan, 'id' | 'timestamp' | 'status'>) {
        const queue = this.getQueue();
        const newScan: QueuedScan = {
            ...scan,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        queue.push(newScan);
        localStorage.setItem(this.storageKey, JSON.stringify(queue));
        return newScan;
    }

    async syncQueue() {
        const queue = this.getQueue().filter(s => s.status === 'pending');
        if (queue.length === 0) return;

        // Marquer comme en cours de sync
        const currentQueue = this.getQueue();
        currentQueue.forEach(s => {
            if (s.status === 'pending') s.status = 'syncing';
        });
        localStorage.setItem(this.storageKey, JSON.stringify(currentQueue));

        try {
            // Utiliser le service agent pour la synchronisation
            const { agentService } = await import('./agentApi');

            const payload = {
                device_id: 1, // TODO: R\u00e9cup\u00e9rer le vrai device_id
                validations: queue.map(s => ({
                    qr_data: s.ticket_code,
                    timestamp: s.timestamp
                }))
            };

            await agentService.syncOfflineScans(payload);

            // Supprimer de la queue après succès
            const updatedQueue = this.getQueue().filter(s => s.status !== 'syncing');
            localStorage.setItem(this.storageKey, JSON.stringify(updatedQueue));

            return true;
        } catch (error) {
            console.error('Offline Sync Failed', error);
            // Remettre en pending
            const fallbackQueue = this.getQueue();
            fallbackQueue.forEach(s => {
                if (s.status === 'syncing') s.status = 'pending';
            });
            localStorage.setItem(this.storageKey, JSON.stringify(fallbackQueue));
            return false;
        }
    }

    isOnline(): boolean {
        return window.navigator.onLine;
    }
}

export const offlineService = new OfflineService();
