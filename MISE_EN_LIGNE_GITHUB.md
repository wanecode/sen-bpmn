# Mettre le dépôt en ligne sur GitHub

Ce guide couvre les réglages qui ne peuvent pas être versionnés dans le dépôt.

## Avant la première publication

1. Vérifier les champs `repository`, `homepage` et `bugs` de `package.json`.
2. Pousser la branche `main`, puis rendre le paquet GHCR public après sa première publication.
3. Définir la variable de dépôt `SITE_URL` avec l’URL publique canonique.

## Règles recommandées pour `main`

Créer un ruleset de branche avec les protections suivantes :

- demande de fusion obligatoire, avec une approbation minimum ;
- annulation des approbations devenues obsolètes après un nouveau commit ;
- résolution obligatoire des conversations ;
- historique linéaire et interdiction du force-push ;
- contrôles obligatoires `BPMN, qualité et build` et `CodeQL JavaScript / TypeScript` ;
- `Revue des dépendances` obligatoire sur les demandes de fusion ;
- branche à jour avant fusion.

## Sécurité et communauté

Dans les paramètres du dépôt :

- activer le graphe des dépendances, les alertes Dependabot et les mises à jour de sécurité ;
- activer le signalement privé des vulnérabilités ;
- vérifier que les issues et discussions sont activées selon le mode de gouvernance choisi ;
- renseigner la description, le site web et les thèmes `bpmn`, `healthcare`, `senegal`, `nextjs` et `open-data`.

Le dépôt contient déjà les modèles d’issue et de demande de fusion, le code de conduite, la politique de sécurité, Dependabot, la CI, CodeQL et la publication d’images signées vers GHCR.
