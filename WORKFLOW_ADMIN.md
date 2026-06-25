# Workflow Admin — Activation des abonnements LYRA

## 📱 1. PARCOURS CLIENT — Paiement via WhatsApp

1. Le client va sur **/pricing**
2. Choisit un plan (Starter, Business, Enterprise)
3. Remplit son **nom** et son **email** dans les champs dédiés
4. Clique sur **"Payer par Mobile Money"**
5. WhatsApp s'ouvre avec un message pré-rempli contenant :
   - Le plan choisi
   - Le prix (mensuel ou annuel selon le toggle)
   - Le nom et l'email saisis
   - La mention "Je paie par Mobile Money"
6. Le client envoie le message

> **Numéro WhatsApp commercial :** [+225 05 85 47 03 03](https://wa.me/2250585470303)

---

## 🧾 2. RÉCEPTION DE LA DEMANDE (Admin)

Quand vous recevez le message WhatsApp :

1. Connectez-vous à **https://lyra-erp.vercel.app/admin**
2. Allez dans la section **"📋 Demandes de souscription"**
3. Vérifiez les informations du client :
   - Nom de la société
   - Plan choisi
   - Montant indiqué

### Créer une subscription manuellement

Si la demande n'apparaît pas encore dans la liste :

1. Cliquez sur **"Créer une société"** (ou allez sur `/auth/new-company`)
2. Ou utilisez directement l'API :
```bash
curl -X POST https://lyra-erp.vercel.app/api/admin/subscription \
  -H "Authorization: Bearer <token_admin>" \
  -H "Content-Type: application/json" \
  -d '{
    "planCode": "starter",
    "companyName": "NOM CLIENT",
    "companyEmail": "email@client.ci",
    "paymentPeriod": "monthly"
  }'
```

---

## 💰 3. CONFIRMATION DE PAIEMENT

1. Vous recevez le paiement Mobile Money (Orange Money, MTN, Moov)
2. Retournez dans **/admin**
3. Trouvez la ligne correspondant au client
4. Dans le sélecteur de statut, passez de `pending_payment` à `paid`
5. Cliquez sur **"Valider ✓"**

> ✅ Le statut passe à `paid`. Un email de confirmation de paiement sera envoyé au client (si Resend est configuré).

---

## 🚀 4. ACTIVATION DU PLAN

1. Une fois le paiement confirmé, passez le statut à `active`
2. Cliquez sur **"Valider ✓"**

> ✅ Le statut passe à `active`. Le client reçoit un email d'activation avec lien vers le dashboard.
> Le client peut maintenant se connecter et utiliser LYRA.

---

## 🔄 5. STATUTS DISPONIBLES

| Statut | Description | Action admin |
|--------|-------------|--------------|
| `trial` | Période d'essai (créé via signup) | Aucune |
| `pending_payment` | Demande reçue, paiement attendu | Attendre le virement |
| `paid` | Paiement reçu, plan pas encore actif | Basculer vers `active` |
| `active` | Plan actif et utilisable | Aucune |
| `suspended` | Suspension pour non-paiement | Basculer vers `active` si régularisé |
| `expired` | Abonnement terminé | Créer une nouvelle souscription |

**Flux recommandé :** `pending_payment` → `paid` → `active`

---

## 🔐 6. BLOCAGE DE SÉCURITÉ

- Un utilisateur dont le statut est `suspended` ou `expired` ne peut **pas se connecter**
- La page de login renvoie une erreur : "Votre abonnement est suspendu"
- Le client ne peut pas accéder au dashboard sans statut `active` ou `trial`

---

## 📊 7. API DE RÉFÉRENCE

### Lister les souscriptions
```http
GET /api/admin/subscriptions
Authorization: Bearer <token>
```
Retourne la liste complète avec société, plan, montant, statut.

### Changer le statut
```http
PUT /api/admin/subscription/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "subscriptionId": "sub-xxxxx",
  "status": "active"
}
```

### Créer une souscription
```http
POST /api/admin/subscription
Authorization: Bearer <token>
Content-Type: application/json

{
  "planCode": "starter|business|enterprise",
  "companyName": "Nom Société",
  "companyEmail": "email@societe.ci",
  "paymentPeriod": "monthly|yearly"
}
```

---

## 📧 8. EMAILS TRANSACTIONNELS

Si Resend est configuré, les emails suivants sont envoyés automatiquement :

| Événement | Email | Destinataire |
|-----------|-------|-------------|
| Inscription | Vérification email (code 6 chiffres) | Nouvel utilisateur |
| Vérification email | Bienvenue dans LYRA | Utilisateur vérifié |
| Demande de paiement | *(manuel — envoyer via WhatsApp)* | — |
| Paiement confirmé → `paid` | Confirmation de paiement + récapitulatif | Client |
| Activation abonnement → `active` | Activation + lien dashboard | Client |
| Mot de passe oublié | Code de réinitialisation (6 chiffres) | Utilisateur |

> **Important :** Remplacer la clé `RESEND_API_KEY` dans `.env` par une vraie clé Resend.
> Vérifier que le domaine d'envoi est validé dans le dashboard Resend.

---

## ✅ 9. CHECKLIST D'ACTIVATION

- [ ] Recevoir la demande WhatsApp
- [ ] Vérifier l'identité du client
- [ ] Confirmer le paiement Mobile Money
- [ ] Se connecter à /admin
- [ ] Créer la souscription (si pas déjà faite)
- [ ] Statut → `paid`
- [ ] Statut → `active`
- [ ] (Optionnel) Envoyer un message WhatsApp au client pour confirmer
- [ ] Le client peut se connecter et configurer sa société
