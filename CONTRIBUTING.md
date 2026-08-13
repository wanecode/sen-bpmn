# Contribuer à SenBPMN

Merci de contribuer à une bibliothèque ouverte des processus hospitaliers sénégalais.

## Principes

- Tous les libellés visibles et toute la documentation métier sont rédigés en français.
- Un modèle décrit un fonctionnement de référence, jamais une prescription clinique universelle.
- Toute proposition doit préciser le contexte, les acteurs concernés et la source de validation métier.
- Ne publiez aucune donnée personnelle, donnée de patient ou information confidentielle.

## Ajouter ou modifier un processus

1. Ouvrir une issue décrivant le besoin et le contexte d’usage.
2. Ajouter ou modifier la fiche dans `lib/catalog-data.ts`, le graphe dans `lib/workflow-data.ts` et sa gouvernance dans `lib/traceability-data.ts`.
3. Documenter les sources de cadrage, le périmètre d’application et les personnes ayant réellement relu le modèle.
4. Lancer `npm run generate:bpmn` pour régénérer les fichiers.
5. Vérifier avec `npm run check:bpmn`, `npm run lint` et `npm run build`.
6. Joindre une capture ou décrire le rendu dans la demande de fusion.

Les corrections ciblées et les demandes de fusion de petite taille sont plus faciles à relire.

La CI régénère systématiquement les BPMN. Une demande échoue si le contenu de `data/bpmn/` ne correspond pas aux définitions déclaratives ou si la traçabilité est incomplète.

## Validation

Une contribution logicielle peut être fusionnée après revue technique. L’adoption opérationnelle d’un processus relève toujours de la gouvernance et des instances compétentes de chaque établissement.
