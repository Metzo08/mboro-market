# JëndCiThiès — Application du cahier des charges v2.0

Ce document trace ce qui a été **réellement implémenté**, ce qui reste **partiel** et ce qui est **volontairement non branché** (aucune simulation présentée comme réelle).

## 1. Synthèse

| Domaine (v2.0) | Statut | Preuves / emplacement |
|---|---|---|
| §2 Identité visuelle | Appliqué | `frontend/src/app/globals.css` (tokens), `layout.tsx` (Poppins + Inter), `Logo.tsx` |
| §3 Design System | Appliqué | `components/ui/*` : Button (4 variantes + loading), Input/Field, Badge (7 tons), Skeleton, EmptyState, SectionHeading |
| §3.3 Mode sombre | Préparé, non activé | Tokens sémantiques uniquement, aucun override sombre |
| §4.1 Accueil | Appliqué | `app/page.tsx` : recherche héro, localité, raccourcis, catégories, boutiques, promos réelles, CTA commerçant |
| §4.2 Fiche boutique | Appliqué | `app/shops/[slug]/page.tsx` : bannière, médaillon, badges vérifiés, ouvert/fermé calculé, WhatsApp/appel/itinéraire, catalogue, horaires, zones de livraison, avis honnêtes |
| §4.3 Dashboard commerçant | Appliqué (sans IA) | `app/merchant/dashboard/page.tsx` : alerte commandes, KPI commandé/encaissé, abonnement, actions suggérées par règles |
| §4.4 Panier / checkout | Appliqué (paiement espèces) | `app/cart`, `app/checkout` en 3 étapes, devis serveur, idempotence, confirmation |
| §5 Modèle économique | Appliqué côté configuration | Tarifs lus depuis `/config/public` + `Setting` en base ; aucune valeur codée dans l'UI |
| §6 Rôles & permissions | Renforcé | Autorisations serveur : boutiques, produits, commandes, paiements ; `shops/me` |
| §8 Catalogue / catégories | Appliqué | CRUD produits, catégories dynamiques, champs catégorie existants en base |
| §8.8 Commandes | Appliqué | Recalcul serveur, stock atomique, transitions validées, anti double-commande |
| §9 Assistant IA | Non implémenté | L'API existante ne fait que stocker des messages ; aucun LLM branché (pas de fausse promesse dans l'UI) |
| §10 Paiements | Désactivés explicitement | `payments.service.ts` : 503 clair, webhook HMAC + montant/devise vérifiés |
| §10.4 Livraison | Appliqué partiellement | Zones + frais réels via `DeliveryZone`, repères/quartier ; pas d'affectation livreur |
| §11 SEO | Appliqué | SSR, metadata dynamique, canonicals, sitemap segmenté, robots, JSON-LD Organization/WebSite/Product/LocalBusiness |
| §12 Multi-tenant | Renforcé | `shopId` dérivé du JWT ou vérifié serveur ; plus d'ID boutique en dur côté front |
| §15 Accessibilité | Partiel | Focus visible, contrastes de la palette, libellés, `aria-*`, réduction de mouvement ; audit WCAG complet non réalisé |
| §18 Tests | Partiel | Builds TypeScript + build Next validés ; tests d'intégration DB non exécutés (pas de PostgreSQL dans l'environnement) |

## 2. Corrections de sécurité / cohérence apportées

1. **Commandes** : `userId`, `shopId`, prix, frais, remises et taxes ne sont plus acceptés depuis le navigateur. Un endpoint public `POST /orders/quote` calcule le total, réutilisé à la création.
2. **Idempotence** : `Order.idempotencyKey` unique + gestion de la course `P2002`.
3. **Stock atomique** : `updateMany` conditionnel (`stock >= quantité`) dans la transaction.
4. **Isolation** : `GET /orders`, `GET /orders/:id`, `PATCH /orders/:id/status`, `GET /payments`, `GET /shops/me` vérifient l'appartenance réelle.
5. **Produits** : création/modification/suppression vérifient la boutique du JWT.
6. **Boutiques** : `ownerId` n'est plus lu dans le body ; `GET /shops` ne renvoie que les boutiques `ACTIVE` sans données privées.
7. **Webhooks** : signature HMAC obligatoire, contrôle montant/devise/prestataire, idempotence par `eventId`.
8. **Paiement en ligne** : refuse explicitement au lieu de créer une fausse transaction réussie.
9. **Fuite de données de démo** : suppression des boutiques fictives, des KPI de démo et des `shopId` codés en dur.
10. **OTP** : le numéro de téléphone est transmis entre connexion et vérification (le parcours était bloqué auparavant).
11. **Rôles** : normalisation MAJUSCULES/minuscules (`RolesGuard`, services) — les routes commerçant ne renvoient plus 403 à tort.

## 3. Limites assumées (à traiter avant production)

- **Base de données** : aucune instance PostgreSQL disponible ici ; migrations/seed non exécutés. `npx prisma generate` et les builds passent.
- **Paiement en ligne** : PayDunya / Wave ne sont pas intégrés. Le checkout propose uniquement le paiement à la livraison, avec message explicite.
- **IA français–wolof** : non branchée. Aucune réponse inventée n'est affichée.
- **Avis** : aucun avis de démonstration ; la fiche explique que seuls les avis liés à une commande vérifiée seront publiés.
- **Commande invité** : non supportée (JWT requis) car `Order.userId` est obligatoire.
- **Recherche tolérante aux fautes/accents** : recherche insensible à la casse uniquement ; l'extension PostgreSQL `unaccent` ou Meilisearch reste à ajouter.
- **SEO local par territoire** : pas encore de pages « catégorie + ville » avec seuil d'offres réelles.
- **CDP / CGU / CGV** : pages de bonne foi, textes à valider juridiquement.
- **Lint** : `npm run lint` remonte des règles React 19 (`set-state-in-effect`) et `no-explicit-any` à nettoyer ; le build TypeScript et le build Next passent.

## 4. Suggestions prioritaires

### P0 — avant pilote
1. Intégrer PayDunya/Wave en sandbox avec webhooks signés et rapprochement, puis activer réellement le checkout en ligne.
2. Ajouter des tests d'isolation multi-tenant automatisés (lecture, écriture, export, recherche, IA) sur une base de test.
3. Brancher un vrai fournisseur SMS/WhatsApp pour l'OTP et les notifications, avec anti-abus/rate limiting.
4. Passer la recherche en `unaccent` + trigrammes PostgreSQL (requêtes `dibi`, `Dibi`, `díbi`) avant Meilisearch.
5. Audit WCAG 2.2 AA + test terrain sur téléphones bas de gamme et connexion 3G.

### P1 — valeur produit
6. Assistant IA avec **outils serveur typés** (créer un brouillon de produit, résumer les ventes, traduire FR↔Wolof), journalisation `AIActionLog`, confirmations explicites, RAG filtré par `shopId`.
7. Onboarding commerçant guidé : vérification des pièces, aperçu avant publication, activation d'abonnement.
8. Notifications in-app + centre de notifications (le schéma existe déjà).
9. Pages SEO « catégorie + territoire » avec seuil minimum d'offres réelles.
10. Images produits : upload S3 + variantes optimisées (WebP), guide photo smartphone.

### P2 — croissance
11. Panier multi-vendeurs et livraison avec affectation + preuve photo.
12. Programme fidélité/parrainage, mode sombre, PWA avec cache lecture seule.
13. Tableau de bord plateforme (MRR, activation, échecs de paiement, coûts IA).

### Décisions d'architecture recommandées
- **Design System** : conserver les tokens CSS actuels et ajouter Storybook pour verrouiller les états des composants.
- **Monorepo** : extraire un package `@jendcithes/ui` quand le back-office Sen-E-Carte arrivera, pour partager les composants.
- **Observabilité** : Sentry + logs structurés + métriques p95 sur `/orders/quote` et `/products`.
- **Sauvegardes** : PostgreSQL chiffré + test de restauration mensuel documenté.
