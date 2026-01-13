import axios from 'axios';

// Instance partagée d'Axios pour toutes les requêtes API
const api = axios.create({
    baseURL: 'http://localhost:8000', // URL du backend
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
    },
    withCredentials: true, // IMPORTANT pour Laravel Sanctum (Cookies)
    withXSRFToken: true,   // Requis pour Laravel 11+
});

export default api;
