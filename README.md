# Hafatza

Application de gestion de stock et de caisse pour la diffusion des livres de Rabbi Nahman de Breslev au prix coûtant.

## Développement local

```bash
npm install
npm run dev
```

Ouvre ensuite l'URL affichée (en général http://localhost:5173).

## Déploiement sur GitHub + Vercel

1. **Créer le repo GitHub**
   ```bash
   git init
   git add .
   git commit -m "Hafatza - version initiale"
   git branch -M main
   git remote add origin https://github.com/TON-COMPTE/hafatza.git
   git push -u origin main
   ```

2. **Déployer sur Vercel**
   - Va sur [vercel.com](https://vercel.com) → "Add New Project"
   - Importe le repo GitHub
   - Vercel détecte automatiquement Vite :
     - Build Command : `vite build` (ou `npm run build`)
     - Output Directory : `dist`
     - Root Directory : laisse vide (racine du repo)
   - Clique "Deploy"

Après le déploiement, l'app est accessible sur l'URL fournie par Vercel (ex: `hafatza.vercel.app`).

## Stockage des données

Les données (catalogue, stock, caisse, ma'asser, mouvements) sont stockées dans le **localStorage du navigateur**. Cela veut dire :
- Les données restent sur l'appareil/navigateur qui les a créées — pas de synchronisation automatique entre ton téléphone et ton ordinateur.
- Si tu vides le cache du navigateur ou changes d'appareil, tu repars de zéro.
- Pour une vraie synchronisation multi-appareils, il faudrait brancher une base de données (ex: Supabase, Firebase) à la place du localStorage — possible à ajouter plus tard si besoin.

## Code admin par défaut

Le code PIN admin par défaut est **1234**, modifiable depuis le tableau de bord une fois connecté.

## Structure du projet

```
├── index.html          → page HTML (charge Tailwind via CDN)
├── src/
│   ├── main.jsx         → point d'entrée React + polyfill localStorage
│   └── App.jsx          → l'application Hafatza complète
├── package.json
└── vite.config.js
```
