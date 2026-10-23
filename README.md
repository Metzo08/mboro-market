# JëndCiThiès by Sen-E-Carte

Plateforme SaaS de commerce local pour Mboro, Thiès et sa région : annuaire public, vitrines indexables, commandes en ligne et espace de gestion commerçant.

> **Cahier des charges v2.0** : l'état d'application détaillé, les limites assumées et les recommandations sont dans [`docs/IMPLEMENTATION_V2.md`](docs/IMPLEMENTATION_V2.md).

## Stack

- **Backend** : NestJS 12 + TypeScript + PostgreSQL + Prisma ORM + Swagger
- **Frontend** : Next.js 16 (App Router, SSR) + React 19 + Tailwind CSS 4
- **Auth** : OTP téléphone + JWT
- **Paiements** : PayDunya / Wave (non branchés — voir limites)
- **Design System** : palette terracotta/teal, Poppins + Inter, tokens sémantiques

## Ports (important)

| Service | Port | URL |
|---|---|---|
| Backend NestJS | **3000** | http://localhost:3000/api · Swagger `/docs` |
| Frontend Next.js | **3001** | http://localhost:3001 |

`PORT=3001` dans `backend/.env` provoque l'erreur frontend `EADDRINUSE: address already in use :::3001`. Le backend refuse désormais de démarrer sur 3001 avec un message explicite.

### Si le port 3001 est déjà occupé (Windows PowerShell)

```powershell
# Voir le processus qui écoute sur 3001
Get-NetTCPConnection -LocalPort 3001 -State Listen | Select-Object OwningProcess
Get-Process -Id <PID>

# Arrêter tous les Node (à utiliser en connaissance de cause)
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

Puis, dans deux terminaux séparés :

```powershell
cd backend;  npm run dev           # alias de start:dev → http://localhost:3000/api
cd frontend; npm run dev           # http://localhost:3001
```

### Si le frontend reçoit des 404 sur `/api/...`

Cela signifie que `NEXT_PUBLIC_API_URL` est relatif (`/api`) et que Next.js répond lui-même.
Deux protections sont en place :

1. `resolveApiBase()` complète l'URL (ex. `http://localhost:3000` → `http://localhost:3000/api`).
2. `next.config.ts` proxifie `/api/:path*` vers `http://localhost:3000` (ou `API_PROXY_TARGET`).

Vérifie simplement que le **backend tourne sur 3000**, puis redémarre `npm run dev` après toute
modification de `.env.local` (les variables `NEXT_PUBLIC_*` sont figées au démarrage).

## Installation

### Backend

```bash
cd backend
npm install
cp .env.example .env           # PORT=3000, DATABASE_URL, JWT_SECRET…
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed            # 3 boutiques, 7 produits, 5 catégories, réglages publics
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:3000/api
npm run dev
```

## Ce qui est appliqué

- **Design System v2.0** : couleurs `#E8632C` / `#115E59` / `#F2A93B`, fonds `#FFFBF5` / `#F5EDE1`, échelle typographique, rayons 8/12/16, ombres, motif bogolan discret, focus visible, `prefers-reduced-motion`.
- **Pages publiques SSR** : accueil, annuaire, fiche boutique, catalogue filtrable, fiche produit, recherche, 404, pages légales.
- **SEO** : metadata dynamique, canonicals, Open Graph, `robots.txt`, sitemap segmenté (pages privées exclues), JSON-LD `Organization`, `WebSite`, `Product`, `LocalBusiness`/`Restaurant`, avec données réelles uniquement.
- **Panier et checkout** : panier mono-boutique, frais de livraison réels par zone, total recalculé par le serveur, clé d'idempotence, confirmation, suivi de commande.
- **Espace commerçant** : tableau de bord (commande vs encaissé), commandes + transitions de statut, catalogue CRUD, fiche boutique (horaires calculés), facturation (flux séparés).
- **Sécurité** : autorisations serveur systématiques, isolation par boutique, webhooks signés HMAC, paiement en ligne explicitement désactivé plutôt que simulé.
- **Mobile-first** : tab bar mobile, panier flottant, formulaires accessibles, cibles tactiles ≥ 36 px.

## Routes principales

```
/                        Accueil
/shops                   Annuaire des boutiques
/shops/[slug]            Fiche boutique
/products                Catalogue
/products/[slug]         Fiche produit
/recherche?q=            Recherche
/cart /checkout /orders  Parcours d'achat
/merchant/dashboard      Tableau de bord
/merchant/orders         Commandes commerçant
/merchant/products       Catalogue commerçant
/merchant/boutique       Fiche boutique (création / édition)
/merchant/payments       Facturation
```

## API ajoutée / corrigée

```
GET    /api/config/public             Configuration publique (localités, tarifs, paiements)
GET    /api/shops?q=&type=&locality= 
GET    /api/shops/me                 Boutiques du commerçant connecté
GET    /api/shops/slug/:slug         Fiche publique par slug
GET    /api/products?q=              Recherche produits
GET    /api/products/slug/:slug      Fiche produit par slug
POST   /api/orders/quote             Devis serveur public
POST   /api/orders                   Commande authentifiée (idempotente)
GET    /api/orders                   Scopé selon le rôle
PATCH  /api/orders/:id/status        Transitions validées
GET    /api/payments?shopId=         Transactions de la boutique
GET    /api/delivery/zones/shop/:id  Zones publiques
```

## Vérifications

```bash
cd backend  && npm run build
cd frontend && npx tsc --noEmit && npm run build
```

Les migrations et le seed nécessitent une base PostgreSQL accessible via `DATABASE_URL`. Aucun test d'intégration base n'est fourni à ce stade.

## Modèle économique (configurable en base)

- Activation : 5 000 FCFA / boutique (une fois)
- Abonnement : 2 500 FCFA / boutique / mois
- Commission : 0 % au lancement

Ces valeurs sont lues depuis `Setting` (`pricing`) et modifiables en back-office, jamais codées dans l'interface.

## Licence

ISC
