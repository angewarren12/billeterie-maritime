# 📱 CYCLE DE VIE COMPLET DES ABONNEMENTS

## 🏗️ ARCHITECTURE

### Base de données

#### Table `subscription_plans` (Plans d'abonnement)
```sql
- id
- name (ex: "Mensuel", "Hebdomadaire")
- price (prix en FCFA)
- duration_days (durée en jours)
- period (ex: "monthly", "weekly")
- category (ex: "standard", "premium")
- is_active (actif ou non)
```

#### Table `subscriptions` (Abonnements utilisateurs)
```sql
- id (UUID)
- user_id (propriétaire)
- plan_id (référence au plan)
- rfid_card_id (carte RFID associée)
- start_date (date début)
- end_date (date fin)
- status ('active', 'expired', 'cancelled')
- current_credit (solde en FCFA)
- created_at, updated_at
```

---

## 🔄 CYCLE DE VIE COMPLET

### 1️⃣ ACHAT D'UN ABONNEMENT (Frontend → Backend)

#### Frontend (`Dashboard.tsx` ou page dédiée)
```tsx
// Utilisateur clique sur "Acheter abonnement mensuel 15 000 FCFA"
const handleBuySubscription = async (planId: string) => {
    const response = await apiService.purchaseSubscription({
        plan_id: planId,
        payment_method: 'orange_money',
        payment_number: '77 123 45 67'
    });
    
    // Réponse : { subscription: {...}, message: "..." }
};
```

#### Backend (`BadgeController.php::purchase`)

**Étapes :**
1. ✅ Validation du `plan_id`
2. 🔍 Récupération du plan depuis DB
3. 💳 Simulation de paiement (TODO: intégrer vraie API)
4. 📝 **Création de l'abonnement** :
   ```php
   Subscription::create([
       'user_id' => $user->id,
       'plan_id' => $plan->id,
       'rfid_card_id' => null, // Optionnel
       'start_date' => now(),
       'end_date' => now()->addDays($plan->duration_days),
       'status' => 'active',
       'current_credit' => $plan->price, // Crédit initial = prix du plan
   ]);
   ```
5. ✅ Retour JSON avec l'abonnement créé

**Résultat :**
- L'utilisateur a maintenant un abonnement **actif**
- Solde : `15 000 FCFA`
- Valide jusqu'au : `start_date + 30 jours`

---

### 2️⃣ AFFICHAGE DES ABONNEMENTS (Frontend)

#### Frontend (`Dashboard.tsx`)
```tsx
useEffect(() => {
    const fetchSubscriptions = async () => {
        const data = await apiService.getActiveSubscriptions();
        // data.subscriptions = [...]
        // data.has_active_subscription = true/false
        setSubscriptions(data.subscriptions);
    };
    fetchSubscriptions();
}, []);
```

#### Backend (`SubscriptionController.php::active`)
```php
$subscriptions = Subscription::getAllActiveForUser($user->id);
// WHERE status = 'active'
// AND end_date >= NOW()
// AND current_credit > 0
```

**Affichage :**
```
┌─────────────────────────────────────┐
│ 💳 Abonnement Mensuel               │
│ Solde : 12 500 FCFA                 │
│ Expire le : 25 Jan 2025             │
│ Statut : 🟢 Actif                   │
└─────────────────────────────────────┘
```

---

### 3️⃣ UTILISATION LORS D'UNE RÉSERVATION

#### Frontend (`Booking.tsx` - Étape Paiement)

**L'utilisateur voit :**
```tsx
<select>
    <option value="">Orange Money</option>
    <option value="">Wave</option>
    <option value="sub-xxx-yyy">
        💳 Utiliser mon abonnement (Solde: 12 500 FCFA)
    </option>
</select>
```

**Envoi au backend :**
```tsx
const booking = await apiService.createBooking({
    trip_id: tripId,
    passengers: [...],
    payment_method: 'subscription',
    subscription_id: 'xxx-yyy-zzz' // ID de l'abonnement
});
```

#### Backend (`BookingController.php::store`)

**Étapes détaillées :**

1. **Vérification abonnement** (ligne 193-203)
```php
if ($request->has('subscription_id') && $user) {
    $subscription = Subscription::find($validated['subscription_id']);
    
    // Sécurité : vérifier que l'abo appartient bien à l'utilisateur
    if (!$subscription || $subscription->user_id !== $user->id) {
        return response()->json(['error' => 'Abonnement non autorisé'], 403);
    }
}
```

2. **Calcul prix avec déduction** (ligne 209-250)
```php
$subscriptionPassIndex = 0; // Premier passager couvert

foreach ($passengers as $index => $passenger) {
    $ticketPrice = calculatePrice($passenger['type'], $passenger['nationality_group']);
    
    // Si c'est le passager couvert par l'abonnement
    if ($index === $subscriptionPassIndex && $subscription) {
        // Vérifier solde suffisant
        if (!$subscription->canCoverAmount($ticketPrice)) {
            return error('Solde insuffisant');
        }
        
        $subscriptionDiscount = $ticketPrice; // Ex: 1500 FCFA
        $ticketPrice = 0; // Client ne paie rien pour ce billet
    }
    
    $totalAmount += $ticketPrice;
}
```

3. **Création des transactions** (ligne 283-294)
```php
// Transaction abonnement
if ($subscription && $subscriptionDiscount > 0) {
    Transaction::create([
        'booking_id' => $booking->id,
        'amount' => $subscriptionDiscount, // 1500 FCFA
        'payment_method' => 'subscription',
        'status' => 'completed',
        'external_reference' => 'SUB-' . $subscription->id,
    ]);
    
    // DÉDUCTION du solde
    $subscription->deductAmount($subscriptionDiscount);
    // current_credit : 12 500 → 11 000 FCFA
}
```

**Résultat :**
- ✅ Billet émis pour le passager
- 💰 Solde abonnement : `12 500 - 1 500 = 11 000 FCFA`
- 🎫 Prix payé par le client : `0 FCFA` (si tous les passagers couverts par abo)

---

### 4️⃣ EXPIRATION AUTOMATIQUE

**Conditions d'expiration :**
```php
public function isActive(): bool
{
    return $this->status === 'active' 
        && $this->end_date >= now()      // Pas expiré temporellement
        && $this->current_credit > 0;    // Solde positif
}
```

**Cas d'expiration :**
1. ⏰ **Date dépassée** : `end_date < now()` → `status = 'expired'`
2. 💸 **Solde épuisé** : `current_credit <= 0` → Ne peut plus payer
3. ❌ **Annulé manuellement** : `status = 'cancelled'`

---

## 📊 EXEMPLE COMPLET

### Scénario : Jean achète un abonnement mensuel

#### T+0 : Achat
```
Plan : Mensuel 15 000 FCFA (30 jours)
Paiement : Orange Money validé
→ Création abonnement
   - start_date: 29 Déc 2024
   - end_date: 28 Jan 2025
   - current_credit: 15 000 FCFA
   - status: active
```

#### T+1 : Première réservation (1 adulte national)
```
Prix billet : 1 500 FCFA
Utilise abonnement : OUI
→ Déduction : 15 000 - 1 500 = 13 500 FCFA
Transaction créée : payment_method='subscription'
```

#### T+10 : Autres réservations
```
Voyage 2 : -1 500 → Solde : 12 000 FCFA
Voyage 3 : -1 500 → Solde : 10 500 FCFA
Voyage 4 : -2 500 → Solde : 8 000 FCFA (enfant africain)
```

#### T+25 : Solde faible
```
Solde : 500 FCFA
Tente réservation 1 500 FCFA
→ ❌ REFUSÉ : "Solde d'abonnement insuffisant"
→ Doit recharger OU payer normalement
```

#### T+31 : Expiration
```
Date : 29 Jan 2025 (end_date dépassé)
→ isActive() = false
→ Ne peut plus utiliser cet abonnement
→ Doit acheter un nouveau plan
```

---

## 🔑 POINTS CLÉS

### ✅ Avantages du système actuel
- Gestion par **solde en FCFA** (flexible)
- Un abonnement peut couvrir **plusieurs voyages**
- Durée limitée (mensuel/hebdomadaire)
- Sécurité : vérification propriétaire

### ⚠️ Limitations actuelles
- Pas de recharge de solde (TODO)
- Pas d'alerte solde faible (TODO)
- Pas de notification d'expiration (TODO)
- Un seul passager couvert par abo (passager 1)

### 🚀 Améliorations futures
1. **Recharge** : Ajouter `recharge($amount)` method
2. **Notifications** : Email/SMS quand solde < 2000 FCFA
3. **Multi-passagers** : Permettre plusieurs passagers couverts
4. **Historique** : Dashboard avec graphiques utilisation
5. **Auto-renewal** : Renouvellement automatique

