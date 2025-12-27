import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('agent_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

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
        return response.data;
    },

    async getTripStats(tripId: string) {
        const response = await api.get(`/scan/statistics`, { params: { trip_id: tripId } });
        return response.data;
    },

    async validateTicket(payload: { ticket_code: string; trip_id: string }) {
        const response = await api.post('/scan/validate', payload);
        return response.data;
    }
};

export default api;
