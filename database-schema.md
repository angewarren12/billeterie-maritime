# Schéma de Base de Données - Billetterie Maritime

Ce document détaille la structure de la base de données PostgreSQL pour le système de billetterie.

## 📐 Diagramme Entité-Relation (ERD)

```mermaid
erDiagram
    %% --- UTILISATEURS & AUTH ---
    User ||--o{ UserRole : has
    User ||--o{ Subscription : possesses
    User ||--o{ Ticket : books
    User ||--o{ Transaction : makes
    
    User {
        uuid id PK
        string email UK
        string phone UK
        string password_hash
        string first_name
        string last_name
        date birth_date
        string nationality
        enum type "RESIDENT, NATIONAL, ETRANGER, AFRICAN"
        string document_number
        string photo_url
        boolean is_active
        timestamp created_at
    }

    Role {
        int id PK
        string name "ADMIN, AGENT_VENTE, AGENT_EMBARQ, CLIENT"
        json permissions
    }
    
    UserRole {
        uuid user_id FK
        int role_id FK
    }

    %% --- ABONNEMENTS & FIDELITÉ ---
    SubscriptionPlan {
        int id PK
        string name "MENSUEL, ANNUEL"
        decimal price
        int duration_days
        int allowed_trips_per_day
        boolean is_active
    }

    Subscription {
        uuid id PK
        uuid user_id FK
        int plan_id FK
        string rfid_card_id UK "UID de la carte physique"
        date start_date
        date end_date
        enum status "ACTIVE, EXPIRED, BLOCKED"
        decimal current_credit "Pour abonnements prépayés"
    }

    LoyaltyCard {
        uuid id PK
        uuid user_id FK
        string card_number UK
        int points_balance
        string tier "BRONZE, SILVER, GOLD"
    }

    %% --- NAVIRES & TRAJETS ---
    Port {
        int id PK
        string name
        string code
    }

    Ship {
        int id PK
        string name
        int total_capacity_pax
        boolean is_active
    }

    Route {
        int id PK
        int departure_port_id FK
        int arrival_port_id FK
        int duration_minutes
    }

    Trip {
        uuid id PK
        int route_id FK
        int ship_id FK
        datetime departure_time
        datetime arrival_time
        enum status "SCHEDULED, BOARDING, DEPARTED, CANCELLED, DELAYED"
        int available_seats_pax
    }

    %% --- TARIFICATION ---
    PricingRule {
        int id PK
        int route_id FK
        enum passenger_type "ADULTE, ENFANT, SENIOR"
        enum nationality_group "NATIONAL, RESIDENT, ETRANGER, CEDEAO"
        decimal base_price
        decimal tax_amount
        boolean is_active
    }

    %% --- BILLETTERIE ---
    Booking {
        uuid id PK
        uuid user_id FK "Client qui réserve"
        uuid operator_id FK "Agent qui vend (si vente physique)"
        string booking_reference UK
        decimal total_amount
        enum status "PENDING, CONFIRMED, CANCELLED"
        timestamp created_at
    }

    Ticket {
        uuid id PK
        uuid booking_id FK
        uuid trip_id FK
        uuid passenger_id FK "Si différent du user booking"
        string qr_code_data UK
        enum status "VALID, USED, CANCELLED, REFUNDED"
        decimal price_paid
        string category_applied "Mémoriser règle tarifaire"
        datetime used_at
    }

    %% --- PAIEMENT ---
    Transaction {
        uuid id PK
        uuid booking_id FK
        decimal amount
        enum method "STRIPE, WAVE, ORANGE_MONEY, CASH, TPE"
        enum status "PENDING, SUCCESS, FAILED"
        string external_ref
        timestamp created_at
    }

    %% --- CONTRÔLE D'ACCÈS ---
    AccessDevice {
        int id PK
        string name "Tourniquet 1"
        string location
        string ip_address
        string type "TRIPOD, PDA, HANDHELD"
    }

    AccessLog {
        uuid id PK
        uuid ticket_id FK
        uuid subscription_id FK
        int device_id FK
        datetime scanned_at
        enum direction "ENTRY, EXIT"
        enum result "GRANTED, DENIED_INVALID, DENIED_CAPACITY"
        string deny_reason
    }

    %% RELATIONS
    UserRole }o--|| User : "assigned to"
    UserRole }o--|| Role : "is"
    Subscription }o--|| User : "owned by"
    Subscription }o--|| SubscriptionPlan : "type of"
    LoyaltyCard ||--|| User : "belongs to"
    
    Trip }o--|| Route : "follows"
    Trip }o--|| Ship : "uses"
    Route }o--|| Port : "from"
    Route |o--|| Port : "to"
    
    PricingRule }o--|| Route : "applies to"
    
    Booking }o--|| User : "made by"
    Ticket }o--|| Booking : "part of"
    Ticket }o--|| Trip : "for"
    
    Transaction }o--|| Booking : "pays for"
    
    AccessLog }o--|| Ticket : "validates"
    AccessLog }o--|| AccessDevice : "at"
```

## 📝 Dictionnaire des Données

### 1. Gestion des Utilisateurs (`users`, `roles`)
La table `users` est centrale. Elle gère à la fois les **clients finaux**, les **agents de guichet** et les **administrateurs**.
- **Discrimination** : Le type d'utilisateur est défini par son rôle (RBAC).
- **Profil Client** : Les champs `nationality`, `type` (Résident, National...) sont cruciaux pour déterminer le tarif applicable automatiquement.

### 2. Gestion des Abonnements (`subscriptions`, `subscription_plans`)
Pour gérer l'exigence des abonnements "mensuel, trimestriel, annuel" et le support RFID.
- `rfid_card_id` : Stocke l'UID unique de la carte physique. Permet un scan rapide au tourniquet.
- **Logique** : Lors d'un scan RFID, le système vérifie si `end_date` > `now()` et si `status` == `ACTIVE`.

### 3. Tarification Dynamique (`pricing_rules`)
C'est le moteur de flexibilité. Au lieu de prix fixes par trajet, on utilise des règles.
- Une règle relie une `route` (ex: Dakar-Gorée) à :
    - Un type de passager (Enfant, Adulte)
    - Un groupe de nationalité (National, Résident, Étranger)
- **Exemple** :
    - Règle 1 : Route A + Adulte + National = 5000 FCFA
    - Règle 2 : Route A + Adulte + Étranger = 8000 FCFA
- Cela permet de modifier les prix sans changer le code.

### 4. Billetterie (`bookings`, `tickets`, `trips`)
- `Booking` : C'est le "Dossier" de réservation (Panier). Peut contenir plusieurs tickets.
- `Ticket` : C'est l'unité de droit de passage (1 personne = 1 ticket).
    - Possède son propre `qr_code_data` unique.
    - Possède un statut `USED` une fois passé au tourniquet.
- `Trip` (Traversée) : Instance concrète d'un voyage à une date/heure donnée.
    - Gère le **Quota** avec `available_seats_pax`.
    - Le système doit décrémenter ce compteur à chaque vente confirmée.

### 5. Contrôle d'Accès (`access_logs`, `access_devices`)
Pour le **reporting détaillé** demandé (Suivi des passages tourniquets, contrôles PDA).
- Chaque scan (réussi ou échoué) est loggué dans `AccessLog`.
- Permet de savoir : "Combien de personnes sont passées au Tourniquet 2 entre 10h et 11h ?".
- Essentiel pour la **détection de fraude** (double passage).

### 6. Paiements (`transactions`)
- Supporte multiples méthodes (`method`).
- `operator_id` dans `Booking` permet de savoir quel Caissier a vendu le ticket (pour le rapport de caisse fin de journée).

---
## 🔍 Points d'attention pour l'implémentation

1.  **Concurrence sur les quotas** : Lors de la réservation, utiliser des *transactions DB* avec verrouillage (ou `UPDATE ... WHERE available_seats > 0`) pour éviter la surréservation.
2.  **Performance RFID** : L'index sur `rfid_card_id` doit être optimal car la validation au tourniquet doit prendre < 500ms.
3.  **Mode Offline** : Les PDA et bornes devront synchroniser une version locale (allégée) des tables `tickets` (pour les départs du jour) et `subscriptions`.
