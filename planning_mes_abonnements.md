---
title: Plan de Configuration des Abonnements
description: Mise en place d'une gestion administrative des plans d'abonnement et de leurs avantages.
---

## 1. Contexte et Objectifs

### Objectif
Permettre aux administrateurs de configurer les **Plans d'Abonnement** (Subscription Plans) via l'interface d'administration.
Cela inclut la définition des :
- Noms des plans (ex: "Access Card", "Business", "Premium").
- Prix.
- Durées (mensuel, annuel).
- Avantages spécifiques (réductions, accès prioritaires, bagages supp.).

### Existant
- Table `subscription_plans` existe déjà (créée dans une migration précédente).
- Modèle `SubscriptionPlan` existe probablement (à vérifier/créer).
- Pas d'interface Admin pour gérer ces plans (actuellement hardcodés ou insérés via seeder).

## 2. Étapes d'Implémentation

### Étape 1 : Backend - Modèle et Contrôleur
1. **Vérifier/Mettre à jour le Modèle `SubscriptionPlan`**
   - S'assurer que les champs `name`, `price`, `duration_days`, `benefits` (JSON), `is_active` sont bien gérés.
   - Ajouter `credits` si ce n'est pas déjà fait (pour le système de recharge).

2. **Créer `SubscriptionPlanController` (Admin API)**
   - CRUD complet :
     - `index`: Lister tous les plans.
     - `store`: Créer un nouveau plan.
     - `update`: Modifier un plan existant (prix, avantages).
     - `destroy`: Supprimer (ou désactiver) un plan.

3. **Routes API**
   - Ajouter `Route::apiResource('subscription-plans', ...)` dans le groupe admin de `api.php`.

### Étape 2 : Frontend - Service API
1. **Types TypeScript**
   - Définir l'interface `SubscriptionPlan` dans `api.ts`.
     ```typescript
     export interface SubscriptionPlan {
         id: number;
         name: string;
         price: number;
         duration_days: number;
         description: string;
         features: string[]; // JSON array
         is_active: boolean;
     }
     ```
2. **Méthodes API**
   - Ajouter `getSubscriptionPlans`, `createSubscriptionPlan`, `updateSubscriptionPlan`, `deleteSubscriptionPlan` dans `apiService`.

### Étape 3 : Frontend - Pages Admin
1. **Page `ListSubscriptionPlans.tsx`**
   - Tableau listant les plans actuels.
   - Affichage des prix et durées.
   - Boutons Modifier/Supprimer/Activer/Désactiver.

2. **Page/Modal `SubscriptionPlanForm.tsx`**
   - Formulaire pour nom, prix, durée.
   - **Gestion dynamique des avantages (Features)** :
     - Une liste d'inputs dynamiques pour ajouter/supprimer des lignes d'avantages (ex: "Accès Salon VIP", "-10% sur les billets").

### Étape 4 : Intégration
1. **Menu Admin**
   - Ajouter une entrée "Abonnements" ou "Configuration -> Abonnements" dans `AdminLayout.tsx`.
2. **Route**
   - Ajouter la route `/admin/subscription-plans` dans `App.tsx`.

## 3. Détails Techniques & Règles

- **JSON Cast** : Le champ `features` (ou `benefits`) dans la DB doit être casté en `array` ou `json` dans le modèle Laravel pour être manipulé facilement par le frontend.
- **Validation** : Le prix doit être positif. La durée en jours doit être un entier positif.
- **Suppression** : Attention, on ne devrait pas supprimer un plan si des utilisateurs y ont souscrit. Préférer un "Soft Delete" ou un flag `is_active = false`.

## 4. Prochaine Action
Attendre la validation de ce plan par l'utilisateur avant de commencer le code.
