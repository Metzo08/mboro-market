#!/usr/bin/env node
import { execSync } from 'child_process';

console.log('🚀 Démarrage de JëndCiThiès backend...\n');

try {
  // Générer Prisma Client
  console.log('📦 Génération du client Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Exécuter les migrations
  console.log('🗄️ Application des migrations...');
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });

  // Exécuter le seed
  console.log('🌱 Chargement des données de démo...');
  execSync('npx ts-node prisma/seed/seed.ts', { stdio: 'inherit' });

  // Démarrer le serveur
  console.log('🌐 Démarrage du serveur sur le port 3000...\n');
  execSync('nest start --watch', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Erreur lors du démarrage:', error.message);
  process.exit(1);
}
