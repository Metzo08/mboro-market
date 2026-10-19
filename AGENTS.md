# Règles pour l'agent Kilo - Projet JëndCiThiès

## Contexte

Projet de plateforme SaaS de commerce local (Mboro/Thiès, Sénégal). Backend NestJS + Frontend Next.js.

## Stack technique

- **Backend** : NestJS 12, TypeScript, PostgreSQL, Prisma ORM, JWT, Passport, Swagger
- **Frontend** : Next.js 16 (App Router), React, Tailwind CSS, Axios, js-cookie
- **Base de données** : PostgreSQL (multi-tenant via shopId/tenantId)

## Commandes utiles

### Backend
```bash
cd backend
npm run build          # Compilation TypeScript
npm run start:dev      # Démarrage en mode watch
npm run prisma:generate # Générer le client Prisma
npm run prisma:migrate  # Appliquer les migrations
npm run prisma:seed     # Charger les données de démo
npx tsc --noEmit       # Vérifier les types (build vérifie déjà)
```

### Frontend
```bash
cd frontend
npm run build          # Build de production
npm run dev            # Démarrage en développement
npx tsc --noEmit       # Vérifier les types
```

## Règles de développement

1. **Ne jamais committer sans demande explicite** de l'utilisateur.
2. **Toujours vérifier la compilation** (`tsc --noEmit` ou `npm run build`) après modification.
3. **Respecter l'isolation multi-tenant** : toutes les requêtes doivent filtrer par `shopId`.
4. **Utiliser Prisma** pour toutes les opérations de base de données.
5. **Les pages publiques** (accueil, produits, boutiques) utilisent le SSR pour le SEO.
6. **Les composants utilisant `usePathname`** doivent avoir la directive `'use client'`.
7. **Les routes dynamiques** qui appellent une API externe doivent utiliser `export const dynamic = 'force-dynamic'` si l'API n'est pas disponible au build.

## Structure des imports

- `@/*` pointe vers `src/*` (backend et frontend)
- Les DTO sont dans `src/modules/<module>/dto/index.ts`
- Les services contiennent la logique métier, les contrôleurs exposent les routes

## Fichiers à ne pas modifier sans précaution

- `backend/prisma/schema.prisma` : schéma de base de données (impacte toute l'app)
- `backend/.env` : variables sensibles (ne jamais committer)
- `frontend/next.config.ts` : configuration Next.js

## Cahier des charges

Le document source est `Cahier_des_charges_JendCiThies_SenECarte.pdf`. Les exigences clés :
- Multi-tenant strict (isolation par shop_id)
- 5 000 FCFA activation + 2 500 FCFA/mois par boutique
- Paiements PayDunya, Wave Business
- Assistant IA français–wolof
- SEO : SSR/prérendu, JSON-LD
