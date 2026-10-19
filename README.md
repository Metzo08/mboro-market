# JëndCiThiès by Sen-E-Carte

Plateforme SaaS de commerce local pour Mboro/Thiès (Sénégal) — place de marché publique + outil de gestion pour commerçants.

## Stack

- **Backend** : NestJS 12 + TypeScript + PostgreSQL + Prisma ORM
- **Frontend** : Next.js 16 + React + Tailwind CSS + App Router (SSR)
- **Auth** : OTP par téléphone + JWT
- **Paiements** : PayDunya, Wave Business (en ligne, à la livraison, retrait)
- **IA** : Assistant multilingue français–wolof

## Structure du projet

```
mboro-market/
├── backend/                 # API NestJS
│   ├── prisma/
│   │   ├── schema.prisma    # Schéma de base de données (multi-tenant)
│   │   └── seed/seed.ts     # Données de démo
│   ├── src/
│   │   ├── main.ts          # Point d'entrée
│   │   ├── app.module.ts    # Module racine
│   │   ├── prisma/prisma.service.ts
│   │   ├── common/          # Décorateurs, guards, filtres, intercepteurs
│   │   └── modules/         # Modules métier
│   │       ├── auth/        # Authentification (OTP, JWT)
│   │       ├── organizations/
│   │       ├── shops/       # Boutiques (multi-tenant)
│   │       ├── categories/  # Catégories avec champs dynamiques
│   │       ├── products/    # Produits et variantes
│   │       ├── orders/      # Commandes
│   │       ├── payments/    # Paiements (PayDunya, Wave)
│   │       ├── subscriptions/ # Abonnements SaaS
│   │       ├── delivery/    # Zones et tâches de livraison
│   │       ├── notifications/
│   │       ├── ai/          # Assistant IA
│   │       └── admin/       # Administration
│   ├── .env                 # Variables d'environnement
│   ├── package.json
│   ├── tsconfig.json
│   └── start-dev.js         # Script de démarrage complet
│
└── frontend/                # Application Next.js
    ├── src/
    │   ├── app/             # Pages (App Router)
    │   │   ├── page.tsx     # Accueil (SSR)
    │   │   ├── products/    # Catalogue produits
    │   │   ├── shops/       # Annuaire boutiques
    │   │   ├── login/       # Connexion OTP
    │   │   ├── register/    # Inscription
    │   │   ├── verify-otp/  # Vérification OTP
    │   │   └── merchant/    # Espace commerçant
    │   ├── components/      # Composants réutilisables
    │   │   ├── layout/      # Navbar, Footer
    │   │   └── ui/          # Button, Input
    │   ├── lib/             # API client, utilitaires
    │   └── types/           # Types TypeScript
    ├── next.config.ts
    ├── package.json
    └── tsconfig.json
```

## Installation et démarrage

### Prérequis
- Node.js 20+
- PostgreSQL (base de données `jendcithes_db`)
- npm ou yarn

### Backend

```bash
cd backend

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos paramètres (DATABASE_URL, JWT_SECRET, etc.)

# Générer Prisma Client
npm run prisma:generate

# Appliquer les migrations
npm run prisma:migrate

# Charger les données de démo
npm run prisma:seed

# Démarrer en mode développement
npm run start:dev
```

L'API sera disponible sur `http://localhost:3000/api`
Documentation Swagger : `http://localhost:3000/docs`

### Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Configurer l'environnement
# Créer .env.local avec NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Démarrer en mode développement
npm run dev
```

L'application sera disponible sur `http://localhost:3001`

### Script de démarrage complet (backend)

```bash
cd backend
node start-dev.js
```

## Variables d'environnement (.env)

```
PORT=3000
CORS_ORIGIN=http://localhost:3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/jendcithes_db?schema=public
JWT_SECRET=change_me_in_production
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
SMS_PROVIDER=sandbox
SMS_API_KEY=
PAYDUNYA_API_KEY=
PAYDUNYA_API_TOKEN=
PAYDUNYA_INVOICE_KEY=
WAVE_API_KEY=
WEBHOOK_SECRET=
```

## Modèle économique (selon le cahier des charges)

- Activation : 5 000 FCFA
- Abonnement mensuel : 2 500 FCFA par boutique
- Paiements : PayDunya, Wave Business (en ligne, à la livraison, retrait)

## API Endpoints principaux

```
POST   /auth/login              # Demander code OTP
POST   /auth/verify-otp         # Vérifier OTP + obtenir JWT
POST   /auth/register           # Inscription
GET    /auth/me                 # Profil utilisateur (authentifié)

GET    /shops                   # Liste des boutiques
POST   /shops                   # Créer une boutique
GET    /shops/:id               # Détail boutique
PATCH  /shops/:id               # Modifier boutique

GET    /categories              # Liste des catégories
POST   /categories              # Créer catégorie

GET    /products                # Liste des produits
POST   /products                # Créer produit
GET    /products/:id            # Détail produit

GET    /orders                  # Liste des commandes
POST   /orders                  # Créer commande
GET    /orders/:id              # Détail commande
PATCH  /orders/:id/status       # Changer statut

POST   /payments/initialize     # Initialiser paiement
POST   /payments/webhook/:provider  # Webhook paiement

GET    /subscriptions/shop/:shopId  # Abonnements boutique
```

## Multitenance

Toutes les ressources sont isolées par `shopId`/`tenantId`. Les routes protégées vérifient que l'utilisateur appartient à la boutique demandée via le guard `ShopOwnerGuard`.

## Cahier des charges

Le document source est `Cahier_des_charges_JendCiThies_SenECarte.pdf`. Le texte décodé se trouve dans `backend/cahier_des_charges_decode.txt`.

## Licence

ISC
