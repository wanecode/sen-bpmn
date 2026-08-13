# Gouvernance de SenBPMN

SenBPMN sépare explicitement la gouvernance logicielle de la validation métier des processus de santé.

## Responsabilités

- Les mainteneurs garantissent la qualité technique, la cohérence BPMN, la traçabilité et la sécurité du dépôt.
- Les contributeurs métier documentent le contexte, les sources et les écarts proposés.
- Seule une instance compétente d’un établissement peut valider un modèle pour son usage local.

La fusion d’une contribution ne vaut jamais validation clinique ou institutionnelle.

## Cycle d’un modèle

1. **Brouillon** : modèle documenté et sourcé, sans validation locale.
2. **En relecture** : relecteurs identifiés et revue métier en cours.
3. **Validé** : version, date, établissement et instance de validation renseignés.

Toute modification substantielle d’un modèle validé le replace en relecture jusqu’à une nouvelle validation.

## Versionnement

Les versions de l’application suivent SemVer : `MAJEURE.MINEURE.CORRECTIF`.

Les workflows suivent une révision `MAJEURE.MINEURE` :

- **MAJEURE** : changement de responsabilités, décisions, événements, entrées ou sorties ;
- **MINEURE** : précision d’une activité, d’un document, d’une source ou de la géométrie sans rupture du parcours.

Une release GitHub publie automatiquement l’image `ghcr.io/wanecode/sen-bpmn` avec son numéro de version.

Chaque génération met aussi à jour `data/bpmn/manifest.json`. Son empreinte SHA-256 permet d’identifier sans ambiguïté le contenu exact d’un modèle dans une release.

## Décisions

Les décisions ordinaires sont discutées dans les issues et demandes de fusion. Les changements de statut métier exigent une preuve de validation communicable et l’identification de l’instance concernée.
