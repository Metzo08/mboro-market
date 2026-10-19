#!/usr/bin/env bash
set -e

echo "🚀 Démarrage de JëndCiThiès backend..."
echo ""

# Générer Prisma Client
echo "📦 Génération du client Prisma..."
npx prisma generate

# Appliquer les migrations
echo "🗄️ Application des migrations..."
npx prisma migrate dev --name init

# Charger les données de démo
echo "🌱 Chargement des données de démo..."
npx ts-node prisma/seed/seed.ts

# Démarrer le serveur
echo "🌐 Démarrage du serveur sur le port 3000..."
echo ""
nest start --watch
