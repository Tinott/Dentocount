# Dentocount

App de gestion d'activité pour dentistes remplaçants — agenda, cabinets,
rétrocessions, objectifs, comparateur de cabinets, bilan mensuel.

100% statique, données 100% locales (localStorage), zéro backend.

## Développement local
```
npm install
npm run dev
```

## Build de production
```
npm run build
```
Le dossier `dist/` contient le site prêt à déployer (Vercel, Netlify, etc.)

## Déploiement sur Vercel
1. Connecte ce repo GitHub à un projet Vercel.
2. Build command : `npm run build` — Output directory : `dist`
3. Chaque push sur la branche principale redéploie automatiquement.

## Ajouter une annonce (onglet "Annonces")
Ouvre `src/App.jsx`, cherche la constante `LISTINGS` en haut du fichier,
ajoute un objet dans le tableau (un modèle est en commentaire juste
au-dessus), puis commit + push.

## Stats de visite
GoatCounter est déjà branché dans `index.html` (compte "valot"),
tableau de bord privé sur https://valot.goatcounter.com
