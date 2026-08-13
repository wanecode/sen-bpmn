# SenBPMN

SenBPMN est une bibliothèque open source pour explorer des processus hospitaliers sénégalais modélisés en français au standard BPMN 2.0.

Le site propose une navigation par catégories, des miniatures de diagrammes, une recherche plein catalogue, une visionneuse interactive basée sur `bpmn-js` et le téléchargement des fichiers source.

## Contenu initial

- 24 processus BPMN enrichis et distincts en français ;
- 8 domaines hospitaliers ;
- rôles et couloirs, événements, documents, exceptions et sous-processus ;
- traçabilité des sources, du périmètre et du statut de validation ;
- catalogue local indexé par SQLite ;
- miniatures chargées à la demande ;
- zoom, déplacement, plein écran et téléchargement ;
- design responsive basé sur les conventions shadcn/ui.

## Démarrage

Prérequis : Node.js 22 ou plus récent.

```bash
npm install
npm run generate:bpmn
npm run dev
```

Ouvrir ensuite [http://localhost:3000](http://localhost:3000).

Le catalogue statique est utilisé par défaut et convient aux déploiements Vercel. En auto-hébergement, définir `SEN_BPMN_STORAGE=sqlite` crée et synchronise automatiquement `data/catalogue.sqlite`. Les métadonnées de référence vivent dans `lib/catalog-data.ts`.

## Commandes utiles

```bash
npm run generate:bpmn  # régénère data/bpmn/*.bpmn
npm run check:bpmn     # valide les 24 fichiers avec bpmn-moddle
npm run lint           # analyse statique
npm run build          # compilation de production
npm run verify         # cycle complet utilisé par la CI
```

## Architecture

```text
app/                   routes Next.js et API de téléchargement
components/            interface, miniatures et visionneuse bpmn-js
data/bpmn/             fichiers BPMN 2.0 et manifeste SHA-256 versionnés
lib/catalog-data.ts    catalogue métier source
lib/db.ts              schéma et requêtes SQLite
scripts/               génération et validation BPMN
.github/               CI, publication GHCR et modèles de contribution
deploy/                reverse proxy HTTPS et exemple d’environnement
```

## Ajouter un parcours

Ajouter une entrée à `processesSeed` dans `lib/catalog-data.ts`, puis lancer :

```bash
npm run generate:bpmn
npm run check:bpmn
```

Chaque processus possède un workflow déclaratif distinct dans `lib/workflow-data.ts`. Le générateur produit les couloirs, activités typées, événements, exceptions, documents et sous-processus ainsi que leur géométrie BPMN DI. Les sources de cadrage et métadonnées de gouvernance se trouvent dans `lib/traceability-data.ts`.

`data/bpmn/manifest.json` associe chaque fichier à sa version, sa révision de workflow, son statut et son empreinte SHA-256. La CI refuse toute divergence entre le manifeste, les sources déclaratives et les fichiers publiés.

Tous les modèles sont publiés au statut **brouillon** tant qu’un établissement ne les a pas relus et validés localement. La date de validation n’est jamais déduite automatiquement.

Consulter [CONTRIBUTING.md](./CONTRIBUTING.md) avant une proposition.

## Intégration continue

Chaque demande de fusion régénère les fichiers BPMN, vérifie qu’ils sont bien versionnés, contrôle leur structure et leur traçabilité, puis exécute le lint et le build Next.js.

Une release GitHub SemVer publie automatiquement une image multi-architecture sur GitHub Container Registry avec une attestation de provenance. Voir [GOVERNANCE.md](./GOVERNANCE.md) pour le cycle de validation et de versionnement.

Avant de publier le dépôt, appliquer la checklist et les protections décrites dans [MISE_EN_LIGNE_GITHUB.md](./MISE_EN_LIGNE_GITHUB.md).

## Docker et déploiement

```bash
docker compose build app
docker compose up -d app
curl http://127.0.0.1:3000/api/sante
```

La base SQLite est conservée dans un volume Docker distinct du contenu BPMN. Pour un déploiement avec domaine et HTTPS automatique via Caddy, suivre [DEPLOYMENT.md](./DEPLOYMENT.md).

## Vercel

Le déploiement Vercel utilise le catalogue statique et les fichiers BPMN versionnés, sans écriture locale au runtime. L’URL canonique est automatiquement dérivée du domaine de production Vercel et peut être remplacée avec `SITE_URL`.

```bash
vercel --prod
```

## Avertissement

Les processus fournis sont des modèles indicatifs destinés à la documentation et à la discussion. Ils ne constituent ni des recommandations médicales, ni des protocoles cliniques validés, ni un dispositif médical. Toute utilisation opérationnelle doit être adaptée et validée par les instances compétentes de l’établissement concerné.

## Licence

Code et modèles sous [licence MIT](./LICENSE).
