# Déployer SenBPMN

SenBPMN est livré comme une application Next.js autonome dans un conteneur non-root. La base SQLite vit dans un volume persistant, tandis que les fichiers BPMN restent immuables dans l’image.

Pour Vercel, le catalogue statique est activé par défaut et aucune base persistante n’est nécessaire. La suite de ce document concerne l’option d’auto-hébergement Docker.

## Prérequis

- Docker Engine 25 ou version ultérieure ;
- Docker Compose v2 ;
- pour HTTPS public : un domaine dont les enregistrements DNS pointent vers le serveur et les ports 80/443 ouverts.

## Test local

```bash
docker compose build app
docker compose up -d app
docker compose ps
curl http://127.0.0.1:3000/api/sante
```

Le volume nommé `sen_bpmn_data` conserve `catalogue.sqlite` et ses journaux WAL entre les redémarrages.

## Production avec domaine et HTTPS

```bash
cp deploy/.env.production.example .env
# Modifier SITE_URL, DOMAIN et SEN_BPMN_IMAGE
docker compose --profile proxy up -d --build
docker compose ps
```

Caddy obtient et renouvelle automatiquement le certificat TLS lorsque le domaine est publiquement résolu. L’application reste liée à `127.0.0.1:3000` sur l’hôte ; le trafic public passe par Caddy.

Pour utiliser une image publiée plutôt qu’un build local :

```bash
docker compose pull app
docker compose --profile proxy up -d --no-build
```

## Sauvegarde SQLite

Utiliser l’API de sauvegarde SQLite depuis un conteneur ponctuel évite de copier une base active :

```bash
docker compose exec app node -e \
  "const D=require('better-sqlite3'); const db=new D('/app/data/catalogue.sqlite'); db.backup('/app/data/catalogue.backup.sqlite').then(()=>console.log('Sauvegarde terminée'))"
```

Copier ensuite `catalogue.backup.sqlite` depuis le volume selon la politique de sauvegarde du serveur.

## Mise à jour

```bash
docker compose pull app
docker compose --profile proxy up -d --no-build
curl -fsS https://VOTRE_DOMAINE/api/sante
```

La base est migrée de façon additive au démarrage. Toujours effectuer une sauvegarde avant une montée de version.

## Publication GHCR

Créer une release GitHub nommée selon SemVer, par exemple `v1.0.0`. Le workflow `Publier l’image Docker` construit les architectures `amd64` et `arm64`, publie les tags correspondants sur GHCR et joint une attestation de provenance.

Configurer la variable de dépôt GitHub `SITE_URL` avant la première release et rendre le paquet GHCR public après sa première publication.

## Contrôles d’exploitation

- Santé : `GET /api/sante` doit répondre `200` et `statut: ok`.
- Journaux : `docker compose logs -f app caddy`.
- Espace disque : surveiller le volume `sen_bpmn_data` et les journaux Docker.
- Redémarrage : la politique `unless-stopped` redémarre les services après un incident ou un redémarrage du serveur.
