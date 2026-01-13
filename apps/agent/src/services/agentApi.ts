import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Intercepteur de requête pour ajouter le token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('agent_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Intercepteur de réponse pour gérer les erreurs
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('agent_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const agentService = {
    async login(email: string, password: string) {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('agent_token', response.data.token);
        }
        return response.data;
    },

    async logout() {
        await api.post('/auth/logout');
        localStorage.removeItem('agent_token');
    },

    async getActiveTrips() {
        const response = await api.get('/trips', { params: { status: 'scheduled,boarding' } });
        // Support both old and new format
        return response.data.data || response.data;
    },

    async getTripStats(tripId: string) {
        const response = await api.get(`/scan/statistics`, { params: { trip_id: tripId } });
        return response.data;
    },

    async validateTicket(payload: { ticket_code: string; trip_id?: string; device_id?: number }) {
        const response = await api.post('/scan/validate', {
            qr_data: payload.ticket_code,
            device_id: payload.device_id || null
        });
        // Backend renvoie directement le résultat (pas de wrapper data)
        return response.data;
    },

    async validateRfid(payload: { rfid_code: string; device_id?: number; direction?: 'entry' | 'exit' }) {
        const response = await api.post('/scan/validate', {
            qr_data: payload.rfid_code, // Le backend détecte automatiquement RFID vs QR
            device_id: payload.device_id || null
        });
        // Backend renvoie directement le résultat
        return response.data;
    },

    async syncOfflineScans(payload: { device_id: number; validations: Array<{ qr_data: string; timestamp: string }> }) {
        const response = await api.post('/scan/sync', payload);
        return response.data;
    }
};

export default api;
