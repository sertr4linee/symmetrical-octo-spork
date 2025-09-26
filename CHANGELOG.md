# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Unreleased]

### Ajouté
- Fonctionnalités en cours de développement

## [0.1.0] - 2025-09-26

### Ajouté
- 🎨 **Interface utilisateur moderne** avec React + TypeScript + Tailwind CSS
- 🖼️ **Canvas HTML5 natif** remplaçant Fabric.js pour de meilleures performances
- 🖌️ **Outils de dessin** : Pinceau, Crayon, Gomme avec paramètres personnalisables
- 🎯 **Outils de sélection** et manipulation d'objets avec drag & drop
- 📐 **Formes géométriques** : Rectangle, Cercle, Triangle, Diamond, Étoile
- 🎨 **Palette de couleurs organisée** avec dropdown et catégories (Primaires, Niveaux de gris, Chaudes, Froides)
- 📋 **Gestion des calques** avec visibilité et opacité
- 🔍 **Zoom et Pan** pour navigation dans le canvas
- 📁 **Gestionnaire de projets** avec création, suppression et sélection
- 📤 **Import/Export d'images** (PNG, JPG, BMP, TIFF) via menu Edit
- 🚀 **Electron** pour application desktop multi-plateforme

### Technique
- 🔧 **Core C++** avec OpenCV pour traitement d'images haute performance
- 🐍 **API Python** avec FastAPI pour backend REST
- 💾 **Base de données SQLite** avec SQLAlchemy ORM
- 🛠️ **Build system** unifié avec script build.sh
- ⚡ **Hot reload** pour développement rapide
- 📦 **Gestion d'état** avec Zustand
- 🎭 **Composants UI** avec Shadcn/UI en mode sombre
- 🖱️ **Gestion d'événements** optimisée pour canvas

### Infrastructure
- 🏗️ **CMake** pour build C++ avec vcpkg pour dépendances
- 🐳 **Environment virtuel Python** avec gestion automatique des versions
- 📋 **TypeScript** avec configuration stricte
- 🎯 **Vite** pour build et développement rapide
- 🔧 **ESLint + Prettier** pour qualité de code
- 📝 **Documentation** complète avec guides de build

### Performances
- ⚡ **Canvas HTML5** natif sans frameworks lourds
- 🗂️ **Cache d'images** pour rendu optimisé
- 🎯 **Détection de collision** précise pour toutes les formes
- 🔄 **Synchronisation calques** en temps réel
- 💾 **Gestion mémoire** optimisée pour images

### Interface
- 🌙 **Mode sombre** exclusif avec thème cohérent
- 📱 **Layout responsive** avec panneaux redimensionnables
- 🖱️ **Curseurs contextuels** selon l'outil sélectionné
- ⌨️ **Raccourcis clavier** pour actions rapides
- 🎨 **Feedback visuel** pour interactions utilisateur

[Unreleased]: https://github.com/sertr4linee/symmetrical-octo-spork/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/sertr4linee/symmetrical-octo-spork/releases/tag/v0.1.0