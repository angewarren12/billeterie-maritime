import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Types
export interface Route {
    id: string;
    name: string;
    departure_port: {
        id: string;
        name: string;
        code: string;
        city: string;
    };
    arrival_port: {
        id: string;
        name: string;
        code: string;
        city: string;
    };
    duration_minutes: number;
    distance_km?: number;
}

export interface Trip {
    id: string;
    departure_time: string;
    arrival_time: string | null;
    status: string;
    route: Route;
    ship: {
        id: string;
        name: string;
        capacity: number;
    };
    capacity_remaining: number;
    availability: 'available' | 'full';
}

export interface SearchParams {
    route_id?: string;
    date?: string;
    min_capacity?: number;
}

export interface PassengerInput {
    type: 'adult' | 'child' | 'baby';
    nationality_group: 'national' | 'resident' | 'african' | 'hors_afrique';
}

export interface PricingResponse {
    route_id: string;
    passengers: number;
    details: Array<{
        type: string;
        nationality_group: string;
        base_price: number;
        tax: number;
        total: number;
    }>;
    total_price: number;
    currency: string;
}

export interface SubscriptionPlanModel {
    id: string;
    name: string;
    price: number;
    duration_days: number;
    period: string;
    credit_type: 'unlimited' | 'counted';
    voyage_credits: number;
}

export interface Subscription {
    id: string;
    plan_name: string;
    plan: SubscriptionPlanModel;
    end_date: string;
    status: string;
    // Nouveaux champs
    voyage_credits_initial: number;
    voyage_credits_remaining: number;
    legacy_credit_fcfa: number;
    // Legacy support (pour compatibilité)
    current_credit: number;
}

export interface SubscriptionResponse {
    subscriptions: Subscription[];
    has_active_subscription: boolean;
}

// API Methods
export const apiService = {
    // Routes
    async getRoutes(): Promise<{ routes: Route[] }> {
        const response = await api.get('/routes');
        return response.data;
    },

    async getRoute(id: string): Promise<{ route: Route }> {
        const response = await api.get(`/routes/${id}`);
        return response.data;
    },

    // Trips
    async searchTrips(params: SearchParams): Promise<{ trips: Trip[]; total: number }> {
        const response = await api.get('/trips', { params });
        return response.data;
    },

    async getTrip(id: string): Promise<{ trip: Trip }> {
        const response = await api.get(`/trips/${id}`);
        return response.data;
    },

    // Pricing
    async calculatePricing(routeId: string, passengers: PassengerInput[]): Promise<PricingResponse> {
        const response = await api.post('/pricing', {
            route_id: routeId,
            passengers,
        });
        return response.data;
    },

    // Auth
    async login(email: string, password: string) {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
        }
        return response.data;
    },

    async register(data: {
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
        phone?: string;
    }) {
        const response = await api.post('/auth/register', data);
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
        }
        return response.data;
    },

    async logout() {
        await api.post('/auth/logout');
        localStorage.removeItem('auth_token');
    },

    async getCurrentUser() {
        const response = await api.get('/auth/me');
        return response.data;
    },

    async updateProfile(data: { name?: string; phone?: string; email?: string; passenger_type?: string; nationality_group?: string }) {
        const response = await api.put('/user/profile', data);
        return response.data;
    },

    // Bookings
    async createBooking(data: {
        trip_id: string;
        payment_method: string;
        subscription_id?: string;
        passengers: Array<{
            name: string;
            type: 'adult' | 'child' | 'baby';
            nationality_group: 'national' | 'resident' | 'african' | 'hors_afrique';
            phone?: string;
        }>;
        create_account?: boolean;
        password?: string;
        email?: string;
        phone?: string;
        passenger_name_for_account?: string;
    }) {
        const response = await api.post('/bookings', data);
        return response.data;
    },

    async getMyBookings() {
        const response = await api.get('/bookings');
        return response.data;
    },

    async getBooking(id: string) {
        const response = await api.get(`/bookings/${id}`);
        return response.data;
    },

    async getPublicBooking(reference: string) {
        const response = await api.get(`/public/booking/${reference}`);
        return response.data;
    },

    async downloadBookingPdf(id: string) {
        const response = await api.get(`/bookings/${id}/pdf`, {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `billet-${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    // Badges & Subscriptions
    async getBadgePlans() {
        const response = await api.get('/badges/plans');
        return response.data;
    },

    async getMySubscription() {
        const response = await api.get('/badges/my-subscription');
        return response.data;
    },

    async getActiveSubscription(): Promise<SubscriptionResponse> {
        const response = await api.get('/subscriptions/active');
        return response.data;
    },

    async subscribeToPlan(data: {
        plan_id: string;
        payment_method: string;
        delivery_method: 'pickup' | 'delivery';
        delivery_address?: string;
    }) {
        const response = await api.post('/badges/subscribe', data);
        return response.data;
    },
};

export default api;
