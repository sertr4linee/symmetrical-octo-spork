# UI - Frontend Electron/React

Ce dossier contient l'interface utilisateur de Better GIMP, développée avec Electron et React.

## Structure

```
ui/
├── src/
│   ├── components/    # Composants React réutilisables
│   ├── pages/         # Pages de l'application
│   ├── hooks/         # Hooks React personnalisés
│   └── utils/         # Utilitaires et helpers
├── public/            # Assets statiques
├── package.json       # Configuration npm
└── electron.js        # Configuration Electron
```

## Technologies

- **React 18**: Framework frontend
- **TypeScript**: Typage statique
- **Electron**: Application desktop
- **Vite 5+**: Build tool moderne
- **shadcn/ui + Tailwind CSS**: Components et styling

## Développement

```bash
cd ui
npm install
npm run dev          # Mode développement web
npm run electron:dev # Mode développement Electron
npm run build        # Build production
```

## Features

- Interface moderne et responsive
- Système de thèmes (clair/sombre)
- Gestion d'état optimisée
- Raccourcis clavier intuitifs
