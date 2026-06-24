# LIVRAISON — LYRA by Vivalys ERP OHADA

## 🎯 Résumé

**LYRA by Vivalys** est un ERP SaaS multi-offres (Starter / Business / Enterprise) destiné aux PME ivoiriennes, conforme SYSCOHADA, avec paie CNPS, fiscalité CI, et IA OHADA conversationnelle.

---

## 🔗 URLs & Accès

### URLs publiques

| Service | URL |
|---------|-----|
| **Application** | http://localhost:3000 (production locale) |
| **Dashboard** | http://localhost:3000/dashboard |
| **Admin** | http://localhost:3000/admin/subscriptions |
| **Pricing** | http://localhost:3000/pricing |
| **Onboarding** | http://localhost:3000/getting-started |

### Compte Super-Admin

| Champ | Valeur |
|-------|--------|
| **Email** | `admin@lyra.ci` |
| **Mot de passe** | `admin123` |

### Compte Démo Société

| Champ | Valeur |
|-------|--------|
| **Société** | LYRA CI (déjà seedée) |
| **Plan** | Business (actif) |
| **Login** | `admin@lyra.ci` / `admin123` |

---

## 🚀 Pour lancer l'application

```bash
cd lyra-erp
npm install
npm run db:push
npm run db:seed
npm run build
npm start
```

---

## 📋 Comment activer un premier client

### Via l'interface admin

1. **Connectez-vous** en admin : http://localhost:3000/login
   - Email : `admin@lyra.ci`
   - Mot de passe : `admin123`

2. **Allez sur l'admin** : http://localhost:3000/admin/subscriptions

3. **Activez un abonnement** :
   - **Option A — Société existante** : sélectionnez une société dans la liste déroulante
   - **Option B — Nouvelle société** : entrez le nom et l'email de la société
   - **Choisissez le plan** : Starter (19 900 FCFA/mois), Business (49 900 FCFA/mois), ou Enterprise (99 900 FCFA/mois)
   - **Choisissez la période** : Mensuel ou Annuel
   - **Cliquez sur "Activer"**

4. **Vérifiez** que l'abonnement apparaît dans le tableau avec le statut "Actif"

5. **Le client peut maintenant se connecter** et son dashboard affichera le plan actif

### Via l'API (automatisation)

```bash
curl -X POST http://localhost:3000/api/admin/subscription \
  -H 'Content-Type: application/json' \
  -H 'Cookie: token=VOTRE_TOKEN_JWT' \
  -d '{
    "companyName": "Nouvelle Société CI",
    "companyEmail": "contact@societe.ci",
    "planCode": "business",
    "paymentPeriod": "monthly"
  }'
```

---

## 👤 Comment créer une société de démo / test

1. **Connectez-vous** en admin
2. **Allez sur** http://localhost:3000/auth/new-company
3. **Étape 1** : Remplissez les infos société (nom, forme juridique, ville, téléphone, email)
4. **Étape 2** : Sélectionnez l'exercice (2024-2025 par défaut)
5. **Étape 3** : Confirmez et créez
6. **Allez sur** http://localhost:3000/admin/subscriptions
7. **Sélectionnez** la nouvelle société dans la liste
8. **Choisissez** le plan "Business"
9. **Activez**

---

## 📊 Fonctionnalités clés

| Module | Description | Limité Starter |
|--------|-------------|---------------|
| **Dashboard** | KPIs, graphiques Recharts, drag & drop widgets | ✅ Basique |
| **Comptabilité SYSCOHADA** | 67 comptes, écritures, balance, grand livre | ✅ Écritures seules |
| **Commercial** | Clients, fournisseurs, factures avec TVA | ✅ Factures simples |
| **Stocks** | Articles, entrepôts, mouvements, alertes seuil | ✅ Articles seuls |
| **Paie & CNPS** | Calcul CNPS, IR, bulletins | ❌ Business+ |
| **Fiscalité** | TVA 18%, déclarations, simulateur | ❌ Business+ |
| **États financiers** | Bilan, CR, TAFIRE | ✅ Simplifié |
| **Chat OHADA** | RAG local, 36 articles OHADA | ✅ Limité |
| **Pricing** | 3 offres comparatives | ✅ Visible |

---

## 🔐 Sécurité & Maintenance

- **Changer le mot de passe admin** : connectez-vous, modifiez dans les paramètres utilisateur
- **Backup DB** : copiez le fichier `prisma/dev.db` régulièrement
- **JWT Secret** : configuré via `JWT_SECRET` dans `.env` (changer pour la production)

---

## 🏗️ Architecture

```
lyra-erp/
├── prisma/        # Schéma + seed DB
├── src/
│   ├── app/       # 34 pages (Next.js App Router)
│   ├── components/# UI, layout, 3D, animations
│   ├── lib/       # Prisma, API client, Framer variants
│   ├── services/  # Logique métier (features, abonnements)
│   ├── styles/    # Tailwind CSS
│   └── types/     # TypeScript interfaces
├── data/          # Base de connaissance OHADA (36 articles)
└── docs/          # Documentation
```

---

## 📜 Licence

**Groupe Vivalys** — Tous droits réservés.
Conçu en Côte d'Ivoire, pour les PME africaines.

---

*Document généré le 24 juin 2026*
