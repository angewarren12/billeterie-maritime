import api from '../lib/axios'; // Import shared instance (Cookie Auth)
import toast from 'react-hot-toast';

// Intercepteur pour la gestion globale des erreurs
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthenticated - Handled by useAuth generally, but here for redirect if needed
            // No removal of localStorage token needed strictly for Cookies
            if (!window.location.pathname.includes('/login')) {
                // Optional: Redirect or let the page handle it
                // window.location.href = '/login'; 
            }
        } else if (error.response?.status === 403) {
            toast.error("Accès refusé : vous n'avez pas les permissions nécessaires.");
        } else if (error.response?.status === 422) {
            const firstError = Object.values(error.response.data.errors || {})[0];
            toast.error(Array.isArray(firstError) ? firstError[0] : "Données invalides");
        } else if (error.response?.status >= 500) {
            toast.error("Erreur serveur : veuillez contacter l'administrateur.");
        }

        return Promise.reject(error);
    }
);

// Types
export interface Port {
    id: number;
    name: string;
    code: string;
    city: string;
    country: string;
    display_name: string;
    available_seats_pax: number;
    images?: string[];
    description?: string;
    pricing_settings?: {
        categories: {
            name: string;
            price: number;
            type: 'ADULT' | 'CHILD';
        }[];
    };
    created_at?: string;
    updated_at?: string;
}

export interface Ship {
    id: number;
    name: string;
    company: string;
    type: string;
    capacity_pax: number;
    is_active: boolean;
    description?: string;
    images?: string[];
}


export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: string;
    cash_desk_id?: number;
    cash_desk?: CashDesk;
}

export interface CashDesk {
    id: number;
    name: string;
    code: string;
    port_id: number;
    is_active: boolean;
    port?: Port;
    agents?: User[];
}

export interface CashSession {
    id: string;
    user_id: string;
    cash_desk_id: string;
    opening_amount: number;
    expected_amount: number;
    closing_amount_declared: number | null;
    discrepancy_amount: number | null;
    status: 'open' | 'closed';
    notes: string | null;
    opened_at: string;
    closed_at: string | null;
    cash_desk?: CashDesk;
}

export interface SubscriptionPlan {
    id: number;
    name: string;
    price: string | number;
    duration_days: number;
    period: 'ANNUEL' | 'MENSUEL';
    category?: string;
    description?: string;
    features?: string[];
    is_active: boolean;
    voyage_credits?: number;
    credit_type?: 'unlimited' | 'counted';
    allow_multi_passenger?: boolean;
}

export interface Route {
    id: number;
    name: string;
    departure_port: {
        id: number;
        name: string;
        code: string;
        city: string;
    };
    arrival_port: {
        id: number;
        name: string;
        code: string;
        city: string;
    };
    duration_minutes: number;
    distance_km?: number;
    is_active?: boolean;
}


export interface Trip {
    id: number;
    departure_time: string;
    arrival_time: string | null;
    status: string;
    route: Route;
    ship: Ship;
    images?: string[];
    description?: string;
    available_seats_pax: number;
    capacity_remaining: number;
    availability: 'available' | 'full';
    base_price: string;
    pricing_settings?: {
        categories: {
            name: string;
            price: number;
            type: 'ADULT' | 'CHILD';
        }[];
    };
}

export interface SearchParams {
    route_id?: string;
    date?: string;
    min_capacity?: number;
}

export interface PassengerInput {
    id?: string;
    name: string;
    type: 'adult' | 'child' | 'baby';
    nationality_group: 'national' | 'resident' | 'african' | 'hors_afrique';
    price?: number;
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

export interface Subscription {
    id: string; // UUID
    plan_name: string;
    plan: SubscriptionPlan;
    end_date: string;
    status: string;
    voyage_credits_initial: number;
    voyage_credits_remaining: number;
    legacy_credit_fcfa: number;
    current_credit: number;
    user_id: number;
    user?: User;
}

export interface SubscriptionResponse {
    subscriptions: Subscription[];
    has_active_subscription: boolean;
}

// Cache simple
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getFromCache = (key: string) => {
    const item = cache[key];
    if (item && (Date.now() - item.timestamp) < CACHE_DURATION) {
        return item.data;
    }
    return null;
};

const setToCache = (key: string, data: any) => {
    cache[key] = { data, timestamp: Date.now() };
};

const invalidateCache = (keyPattern: string) => {
    Object.keys(cache).forEach(key => {
        if (key.includes(keyPattern)) {
            delete cache[key];
        }
    });
};

// API Methods
export const apiService = {
    clearCache: (key?: string) => {
        if (key) {
            invalidateCache(key);
        } else {
            Object.keys(cache).forEach(k => delete cache[k]);
        }
        // Force specific invalidation of common keys
        delete cache['admin_ports'];
        delete cache['admin_routes'];
        delete cache['admin_ships'];
    },
    // Routes
    async getRoutes(): Promise<{ routes: Route[] }> {
        const response = await api.get('/api/routes');
        return response.data;
    },

    async getRoute(id: string): Promise<{ route: Route }> {
        const cached = getFromCache(`route_${id}`);
        if (cached) return cached;
        const response = await api.get(`/api/routes/${id}`);
        setToCache(`route_${id}`, response.data);
        return response.data;
    },

    // Trips
    async searchTrips(params: SearchParams): Promise<{ trips: Trip[]; total: number }> {
        const response = await api.get('/api/trips', { params });
        return response.data.data; // Extract from standardized format
    },

    async getTrip(id: string): Promise<Trip> {
        const response = await api.get(`/api/trips/${id}`);
        return response.data.data; // Extract from standardized format
    },

    // Admin Trips
    getAdminTrips: async (filters: { page?: number; search?: string; route_id?: string; status?: string; departure_port_id?: number } = {}) => {
        const params = new URLSearchParams();
        if (filters.page) params.append('page', String(filters.page));
        if (filters.search) params.append('search', filters.search);
        if (filters.route_id && filters.route_id !== 'all') params.append('route_id', filters.route_id);
        if (filters.status && filters.status !== 'all') params.append('status', filters.status);
        if (filters.departure_port_id) params.append('departure_port_id', String(filters.departure_port_id));

        const response = await api.get(`/api/admin/trips?${params.toString()}`);
        return response.data;
    },

    createTrip: async (formData: FormData) => {
        const response = await api.post('/api/admin/trips', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    batchCreateTrips: async (formData: FormData) => {
        const response = await api.post('/api/admin/trips/batch', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    updateTrip: async (id: string, formData: FormData) => {
        // Pour Laravel, PUT avec fichiers doit souvent passer par POST + _method=PUT
        formData.append('_method', 'PUT');
        const response = await api.post(`/api/admin/trips/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    deleteTrip: async (id: string) => {
        const response = await api.delete(`/api/admin/trips/${id}`);
        return response.data;
    },

    // Resources pour les listes déroulantes
    // Admin Ships
    getShips: async () => {
        const response = await api.get('/api/admin/ships');
        return response.data;
    },

    createShip: async (formData: FormData) => {
        const response = await api.post('/api/admin/ships', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        invalidateCache('admin_ships');
        return response.data;
    },

    updateShip: async (id: number, formData: FormData) => {
        formData.append('_method', 'PUT');
        const response = await api.post(`/api/admin/ships/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        invalidateCache('admin_ships');
        return response.data;
    },

    deleteShip: async (id: number) => {
        const response = await api.delete(`/api/admin/ships/${id}`);
        invalidateCache('admin_ships');
        return response.data;
    },

    // Admin Subscription Plans
    getSubscriptionPlans: async () => {
        const cached = getFromCache('admin_subscription_plans');
        if (cached) return cached;
        const response = await api.get('/api/admin/subscription-plans');
        setToCache('admin_subscription_plans', response.data);
        return response.data;
    },

    createSubscriptionPlan: async (data: Partial<SubscriptionPlan>) => {
        const response = await api.post('/api/admin/subscription-plans', data);
        return response.data;
    },

    updateSubscriptionPlan: async (id: number, data: Partial<SubscriptionPlan>) => {
        const response = await api.put(`/api/admin/subscription-plans/${id}`, data);
        return response.data;
    },

    deleteSubscriptionPlan: async (id: number) => {
        const response = await api.delete(`/api/admin/subscription-plans/${id}`);
        return response.data;
    },

    // Admin Subscriptions (Badges)
    getAdminSubscriptions: async (params?: { search?: string; status?: string; page?: number }) => {
        const response = await api.get('/api/admin/subscriptions', { params });
        return response.data;
    },

    getAdminSubscriptionDetails: async (id: string) => {
        const response = await api.get(`/api/admin/subscriptions/${id}`);
        return response.data;
    },

    updateSubscriptionStatus: async (id: string, status: string) => {
        const response = await api.put(`/api/admin/subscriptions/${id}/status`, { status });
        return response.data;
    },

    associateRfid: async (id: string, rfid_card_id: string) => {
        const response = await api.post(`/api/admin/subscriptions/${id}/associate-rfid`, { rfid_card_id });
        return response.data;
    },

    deliverSubscription: async (id: string) => {
        const response = await api.post(`/api/admin/subscriptions/${id}/deliver`);
        return response.data;
    },

    posSale: async (data: any) => {
        const response = await api.post('/api/admin/pos/sale', data);
        return response.data;
    },

    searchPosCustomers: async (query: string) => {
        const response = await api.get('/api/admin/pos/customers', { params: { q: query } });
        return response.data;
    },

    createPosCustomer: async (data: { name: string; phone?: string; email?: string }) => {
        const response = await api.post('/api/admin/pos/customers', data);
        return response.data;
    },

    startPosSession: async (data: { opening_amount: number; cash_desk_id: number }) => {
        const response = await api.post('/api/admin/pos/session/start', data);
        return response.data;
    },

    closePosSession: async (data: { closing_amount_declared: number; notes?: string }) => {
        const response = await api.post('/api/admin/pos/session/close', data);
        return response.data;
    },

    getPosSessionStatus: async () => {
        const response = await api.get('/api/admin/pos/session/status');
        return response.data;
    },

    salePosSubscription: async (data: { user_id: number; plan_id: number; payment_method: string; rfid_card_id?: string }) => {
        const response = await api.post('/api/admin/pos/subscription/sale', data);
        return response.data;
    },

    getAccessLogs: async (params?: { limit?: number; page?: number }) => {
        const response = await api.get('/api/admin/access-logs', { params });
        return response.data;
    },

    getLatestAccessLogs: async (lastId?: string) => {
        const response = await api.get('/api/admin/access-logs/latest', { params: { last_id: lastId } });
        return response.data;
    },

    // Admin Users
    getAdminUsers: async (params?: { search?: string; role?: string; type?: 'clients' | 'staff'; page?: number }): Promise<User[] | { data: User[] } | any> => {
        const response = await api.get('/api/admin/users', { params });
        return response.data;
    },

    async getAdminUserDetails(id: string) {
        const response = await api.get(`/api/admin/users/${id}`);
        return response.data;
    },

    createUser: async (userData: any) => {
        const response = await api.post('/api/admin/users', userData);
        return response.data;
    },

    // Resources pour les listes déroulantes
    getAdminShips: async () => {
        const cached = getFromCache('admin_ships');
        if (cached) return cached;

        const response = await api.get('/api/admin/ships');
        setToCache('admin_ships', response.data);
        return response.data;
    },

    // Admin Ports
    getPorts: async (): Promise<Port[]> => {
        const response = await api.get('/api/ports');
        const data = response.data.data || response.data;
        const portsArray = Array.isArray(data) ? data : (data.data || []);

        return portsArray;
    },

    createPort: async (data: Omit<Port, 'id'>) => {
        const response = await api.post('/api/admin/ports', data);
        invalidateCache('admin_ports');
        return response.data;
    },

    updatePort: async (id: number, data: Partial<Omit<Port, 'id'>>) => {
        const response = await api.put(`/api/admin/ports/${id}`, data);
        invalidateCache('admin_ports');
        return response.data;
    },

    deletePort: async (id: number) => {
        const response = await api.delete(`/api/admin/ports/${id}`);
        invalidateCache('admin_ports');
        return response.data;
    },

    getAdminRoutes: async () => {
        const cached = getFromCache('admin_routes');
        if (cached) return cached;

        const response = await api.get('/api/admin/routes');
        setToCache('admin_routes', response.data);
        return response.data;
    },

    createRoute: async (data: any) => {
        const response = await api.post('/api/admin/routes', data);
        invalidateCache('admin_routes');
        return response.data;
    },

    updateRoute: async (id: string, data: any) => {
        const response = await api.put(`/api/admin/routes/${id}`, data);
        invalidateCache('admin_routes');
        return response.data;
    },

    deleteRoute: async (id: string) => {
        const response = await api.delete(`/api/admin/routes/${id}`);
        invalidateCache('admin_routes');
        return response.data;
    },

    // Pricing
    async calculatePricing(routeId: string, passengers: PassengerInput[]): Promise<PricingResponse> {
        const response = await api.post('/api/pricing', {
            route_id: routeId,
            passengers,
        });
        return response.data;
    },

    // Auth
    async login(email: string, password: string) {
        const response = await api.post('/api/auth/login', { email, password });
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
        const response = await api.post('/api/auth/register', data);
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
        }
        return response.data;
    },

    async logout() {
        await api.post('/api/auth/logout');
        localStorage.removeItem('auth_token');
    },

    async getCurrentUser() {
        const response = await api.get('/api/auth/me');
        return response.data.data;
    },

    async updateProfile(data: { name?: string; phone?: string; email?: string; passenger_type?: string; nationality_group?: string }) {
        const response = await api.put('/api/user/profile', data);
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
        user_id?: string;
    }) {
        const response = await api.post('/api/bookings', data);
        return response.data;
    },

    async getBooking(id: string) {
        const response = await api.get(`/api/bookings/${id}`);
        return response.data;
    },

    async getMyBookings() {
        const response = await api.get('/api/bookings');
        return response.data;
    },

    async getDashboardStats() {
        const response = await api.get('/api/admin/dashboard/stats');
        return response.data;
    },

    async getCashierDashboardStats() {
        const response = await api.get('/api/admin/dashboard/cashier-stats');
        return response.data;
    },

    async getAdminBookings(params?: { search?: string; status?: string; page?: number; limit?: number }) {
        const response = await api.get('/api/admin/bookings', { params });
        return response.data;
    },

    async getAdminBookingDetail(id: string) {
        const response = await api.get(`/api/admin/bookings/${id}`);
        return response.data;
    },

    async getPublicBooking(reference: string) {
        const response = await api.get(`/api/public/booking/${reference}`);
        return response.data;
    },

    async getPublicRoutes(): Promise<Route[]> {
        const response = await api.get('/api/routes');
        return response.data.routes;
    },


    async downloadBookingPdf(id: string) {
        const response = await api.get(`/api/bookings/${id}/pdf`, {
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
        const cached = getFromCache('badge_plans');
        if (cached) return cached;
        const response = await api.get('/api/badges/plans');
        setToCache('badge_plans', response.data);
        return response.data;
    },

    async getMySubscription() {
        const response = await api.get('/api/badges/my-subscription');
        return response.data;
    },

    async getActiveSubscription(): Promise<SubscriptionResponse> {
        const response = await api.get('/api/subscriptions/active');
        return response.data;
    },

    async subscribeToPlan(data: {
        plan_id: string;
        payment_method: string;
        delivery_method: 'pickup' | 'delivery';
        delivery_address?: string;
        user_id?: string;
    }) {
        const response = await api.post('/api/badges/subscribe', data);
        invalidateCache('my-subscription');
        invalidateCache('active');
        return response.data;
    },

    // Gestion des Guichets
    async getCashDesks(params?: { search?: string }): Promise<CashDesk[]> {
        const response = await api.get('/api/admin/cash-desks', { params });
        return response.data;
    },

    async getCashDesk(id: string): Promise<CashDesk> {
        const response = await api.get(`/api/admin/cash-desks/${id}`);
        return response.data;
    },

    async createCashDesk(data: Partial<CashDesk>): Promise<CashDesk> {
        const response = await api.post('/api/admin/cash-desks', data);
        return response.data;
    },

    async updateCashDesk(id: number, data: Partial<CashDesk>): Promise<CashDesk> {
        const response = await api.put(`/api/admin/cash-desks/${id}`, data);
        return response.data;
    },

    async deleteCashDesk(id: number): Promise<void> {
        await api.delete(`/api/admin/cash-desks/${id}`);
    },

    async assignAgentToCashDesk(cashDeskId: number, userId: string | number): Promise<any> {
        const response = await api.post(`/api/admin/cash-desks/${cashDeskId}/assign`, { user_id: userId });
        return response.data;
    },

    async unassignAgentFromCashDesk(userId: string | number): Promise<any> {
        const response = await api.post(`/api/admin/users/${userId}/unassign-cash-desk`);
        return response.data;
    },

    async getCashDeskStats(cashDeskId: number): Promise<any> {
        const response = await api.get(`/api/admin/reports/cash-desk/${cashDeskId}/stats`);
        return response.data;
    },

    // Supervisor Service
    getSupervisorDashboard: async () => {
        const response = await api.get('/api/admin/supervisor/dashboard');
        return response.data;
    },

    getSupervisorCashDesks: async () => {
        const response = await api.get('/api/admin/supervisor/cash-desks');
        return response.data;
    },

    closeCashDeskRemotely: async (id: number) => {
        const response = await api.post(`/api/admin/supervisor/cash-desks/${id}/close`);
        return response.data;
    },

    getSupervisorSalesHistory: async () => {
        const response = await api.get('/api/admin/supervisor/sales-history');
        return response.data;
    },
};

export default api;
