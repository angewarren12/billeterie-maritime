import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Script de test de charge (Load Test) pour la Billetterie Maritime.
 * Simule une montée en charge à l'échelle de la population sénégalaise.
 * 
 * Pour lancer le test (nécessite l'installation de k6) :
 * k6 run senegal-load-test.js
 */

export const options = {
    stages: [
        { duration: '30s', target: 50 },  // Phase 1 : Montée progressive à 50 utilisateurs
        { duration: '1m', target: 200 },  // Phase 2 : Pic de charge à 200 utilisateurs (simulant un rush de Tabaski)
        { duration: '30s', target: 0 },   // Phase 3 : Redescente
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% des requêtes doivent répondre en moins de 500ms
    },
};

const BASE_URL = 'http://localhost:8000/api';

export default function () {
    // 1. Recherche de trajets (Consultation des horaires)
    // C'est l'action la plus courante pour un client sénégalais.
    let res = http.get(`${BASE_URL}/trips?status=scheduled`);
    check(res, {
        'Heures de trajets : statut 200': (r) => r.status === 200,
        'Heures de trajets : réponse rapide': (r) => r.timings.duration < 500,
    });

    sleep(1);

    // 2. Consultation des détails d'un trajet spécifique
    // On simule un utilisateur qui clique sur un trajet.
    let trips = res.json().data.trips;
    if (trips && trips.length > 0) {
        let tripId = trips[0].id;
        let resDetail = http.get(`${BASE_URL}/trips/${tripId}`);
        check(resDetail, {
            'Détails trajet : statut 200': (r) => r.status === 200,
        });
    }

    sleep(2);

    // 3. Simulation de tentative de connexion (Optionnel, gourmand en CPU)
    // Note: On utilise des identifiants au hasard pour tester la robustesse.
    let loginData = {
        email: `test.${Math.floor(Math.random() * 2000)}@example.sn`,
        password: 'password123',
    };
    let resLogin = http.post(`${BASE_URL}/auth/login`, JSON.stringify(loginData), {
        headers: { 'Content-Type': 'application/json' },
    });

    // On ne vérifie pas 200 ici car les comptes n'existent peut-être pas tous encore
    check(resLogin, {
        'Login : serveur répond': (r) => r.status < 500,
    });

    sleep(3);
}
