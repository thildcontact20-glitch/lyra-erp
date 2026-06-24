# LYRA by Vivalys — ERP OHADA pour PME Ivoiriennes

**LERP financier des PME OHADA** — Comptabilite SYSCOHADA, fiscalite ivoirienne, paie & CNPS, etats financiers automatiques, IA conversationnelle OHADA.

---

## 🚀 Prérequis

- **Node.js** 18+ (20 recommande)
- **npm** 9+
- Aucune base de donnees a installer (SQLite embarque)

## 📦 Installation & Lancement

```bash
cd lyra-erp
npm install
npm run db:push
npm run db:seed
npm run dev
```

Application accessible sur **http://localhost:3000**

## 🔑 Comptes de demonstration

Admin: admin@lyra.ci / admin123

## ✨ Fonctionnalites

- Dashboard avec KPIs, graphiques, drag & drop
- Comptabilite SYSCOHADA (67 comptes, ecritures, balance)
- Gestion commerciale (clients, fournisseurs, factures)
- Stocks (articles, entrepots, mouvements, alertes)
- Paie & CNPS Cote dIvoire (calcul automatique)
- Fiscalite ivoirienne (TVA 18