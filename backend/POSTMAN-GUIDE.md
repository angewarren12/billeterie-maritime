# Guide d'utilisation - Collection Postman API

## 📥 Importation

1. Ouvrir Postman
2. Cliquer sur **Import**
3. Sélectionner le fichier `Maritime-Billetterie-API.postman_collection.json`
4. La collection apparaît dans la barre latérale

## ⚙️ Configuration

### Variables d'environnement

La collection utilise 3 variables :

- `base_url` : URL de base de l'API (par défaut: `http://127.0.0.1:8000/api`)
- `auth_token` : Token d'authentification (auto-rempli après login)
- `booking_id` : ID de réservation (auto-rempli après création)

### Modifier l'URL de base

Si votre serveur tourne sur un autre port :

1. Cliquer sur la collection → Variables
2. Modifier `base_url` (exemple : `http://localhost:8080/api`)

## 🧪 Tests en 5 Minutes

### 1️⃣ Vérifier que l'API fonctionne

```
GET Health Check
```

✅ Réponse attendue : Status 200
```json
{
  "status": "ok",
  "service": "Maritime Billetterie API"
}
```

### 2️⃣ Créer un compte utilisateur

```
POST Auth → Register
```

Body déjà pré-rempli :
```json
{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

✅ Réponse : Status 201 avec `user` et `token`

### 3️⃣ Se connecter

```
POST Auth → Login
```

**Important** : Le token est automatiquement sauvegardé dans la variable `{{auth_token}}` grâce au script de test.

### 4️⃣ Consulter les trajets disponibles

```
GET Routes → List All Routes
```

Copier l'ID d'une route pour l'étape suivante.

### 5️⃣ Rechercher des voyages

```
GET Trips → Search Trips
```

Query params déjà configurés :
- `route_id=1`
- `date=2025-01-15`

Modifier les valeurs selon vos besoins.

### 6️⃣ Calculer le prix

```
POST Trips → Calculate Pricing
```

Body exemple :
```json
{
  "route_id": 1,
  "passengers": [
    { "type": "adult", "nationality_group": "national" },
    { "type": "child", "nationality_group": "national" }
  ]
}
```

### 7️⃣ Créer une réservation

```
POST Bookings → Create Booking
```

**Attention** : Remplacer `"trip_id": "put-trip-uuid-here"` par un véritable UUID récupéré de l'étape 5.

✅ L'ID de réservation est auto-sauvegardé dans `{{booking_id}}`.

### 8️⃣ Consulter mes réservations

```
GET Bookings → List My Bookings
```

Affiche toutes vos réservations.

### 9️⃣ Détails d'une réservation

```
GET Bookings → Get Booking Details
```

Utilise automatiquement `{{booking_id}}` de l'étape 7.

## 🔐 Authentification

### Routes protégées

Les endpoints avec 🔒 nécessitent un token :

- `GET /auth/me`
- `PUT /user/profile`
- `POST /bookings`
- `GET /bookings`
- etc.

Le token est automatiquement inclus dans le header :
```
Authorization: Bearer {{auth_token}}
```

### Renouveler le token

Si le token expire (401 Unauthorized) :

1. Re-lancer `POST Auth → Login`
2. Le nouveau token sera automatiquement sauvegardé

## 📊 Scripts automatiques

La collection inclut des scripts qui s'exécutent automatiquement :

### Après Login
```javascript
// Sauvegarde le token dans la variable d'environnement
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("auth_token", jsonData.token);
}
```

### Après Create Booking
```javascript
// Sauvegarde l'ID de réservation
if (pm.response.code === 201) {
    var jsonData = pm.response.json();
    pm.environment.set("booking_id", jsonData.booking.id);
}
```

## 🐛 Résolution de problèmes

### Erreur 401 Unauthorized
- Vérifier que vous êtes connecté (Login)
- Vérifier que `{{auth_token}}` est bien rempli

### Erreur 404 Not Found
- Vérifier que le serveur Laravel tourne : `php artisan serve`
- Vérifier l'URL : `http://127.0.0.1:8000/api`

### Erreur 422 Validation Error
- Lire le message d'erreur dans `errors`
- Vérifier le format des données (email, required fields, etc.)

### Erreur 500 Internal Server Error
- Consulter les logs Laravel : `storage/logs/laravel.log`
- Vérifier la connexion à la base de données

## 📝 Exemples de réponses

### Succès (Register)
```json
{
  "message": "Inscription réussie",
  "user": {
    "id": "uuid",
    "name": "Jean Dupont",
    "email": "jean@example.com"
  },
  "token": "1|xxxxx"
}
```

### Erreur (Validation)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email has already been taken."]
  }
}
```

### Erreur (Auth)
```json
{
  "message": "Unauthenticated."
}
```

## 🚀 Workflow complet

1. **Register** → Créer compte
2. **Login** → Obtenir token
3. **List Routes** → Voir trajets disponibles
4. **Search Trips** → Chercher voyages
5. **Calculate Pricing** → Estimer prix
6. **Create Booking** → Réserver
7. **Get Booking Details** → Consulter billet
8. **Logout** → Déconnexion

## ⚡ Raccourcis Postman

- `Ctrl + Enter` : Envoyer la requête
- `Ctrl + /` : Rechercher dans la collection
- `Ctrl + E` : Gérer les environnements

## 📖 Documentation API complète

Pour plus de détails, consultez [`api-tests.md`](./api-tests.md)
