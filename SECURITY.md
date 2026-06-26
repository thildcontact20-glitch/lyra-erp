# Sécurité — LYRA ERP by Groupe Vivalys

## 🔒 Protection anti-vol

Ce dépôt contient la propriété intellectuelle du Groupe Vivalys.
Toute tentative de vol, copie, reverse engineering ou redistribution est passible
de poursuites pénales (loi ivoirienne n°2016-555 du 26 juillet 2016).

## 🛡️ Mesures techniques

- Toutes les clés API sont stockées dans Vercel Environment Variables
- Le fichier .env est GITIGNORÉ — jamais commité
- Middleware d'authentification sur toutes les routes protégées
- CSP (Content Security Policy) active
- Anti-copié via headers HTTP et JavaScript
- Sessions JWT avec timeout court

## 🚨 Signaler une faille

Si vous découvrez une vulnérabilité, contactez immédiatement :
**contact@vivalyscompagny.com**
