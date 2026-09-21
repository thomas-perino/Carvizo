# Market Value Engine

Ce module estime la valeur de marché d'un véhicule à partir de véhicules
comparables — en imitant le raisonnement d'un professionnel de la reprise
automobile (comparaison avec des véhicules réellement similaires), **pas**
une simple moyenne des prix du même modèle.

Il est **indépendant** de l'UI, de Supabase, des sources d'annonces et de
l'IA : il ne travaille que sur des `ComparableVehicle` / `TargetVehicle`
fournis en mémoire, et peut être testé isolément (voir `tests/market-value/`).

## Pipeline

```text
TargetVehicle + ComparableVehicle[]
      ↓
comparable-search.ts     Filtre obligatoire (marque+modèle), score de similarité,
                          seuil minimal (MIN_SIMILARITY_THRESHOLD = 40/100)
      ↓
comparable-weight.ts     Détection des valeurs aberrantes (MAD), puis pondération
                          par le CARRÉ du score de similarité
      ↓
estimate-market-value.ts Moyenne pondérée -> ajustements -> fourchette -> confiance
      ↓
MarketValueEstimate { low, estimated, high, confidence, ... }
```

`vehicle-value-analysis.ts` ajoute une couche au-dessus : à partir d'une
`MarketValueEstimate` "saine" et d'une liste de `VehicleConditionIssue`
(problèmes d'état structurés, fournis par l'appelant — jamais devinés ici),
elle produit `{ healthyValue, currentValue, afterRepairValue }`.

## Sélection des comparables

Un véhicule d'un autre modèle **n'est jamais** un comparable, même très
ressemblant par ailleurs (`findComparables`, filtre obligatoire marque +
modèle). Si aucun comparable exact n'existe, la recherche est élargie à la
marque seule — dégradation explicite, jamais silencieuse
(`widenedToMakeOnly`, reflété dans la méthodologie et la confiance). Si même
la marque ne renvoie rien, `NoComparablesFoundError` est levée : le moteur
préfère échouer clairement plutôt que d'inventer un chiffre.

Parmi les candidats restants, chacun reçoit un score de similarité
(`comparable-score.ts`) ; ceux sous `MIN_SIMILARITY_THRESHOLD` (40/100) sont
conservés dans le résultat pour la transparence mais marqués `used: false`.

## Score de similarité (0 à 100)

| Critère | Poids max | Catégorie |
| --- | --- | --- |
| Génération | 15 | Très important |
| Motorisation (écart de puissance) | 20 | Très important |
| Carburant | 10 | Très important |
| Transmission | 10 | Très important |
| Année | 14 | Important |
| Kilométrage | 14 | Important |
| Finition | 10 | Important |
| État déclaré | 3 | Secondaire |
| Localisation | 2 | Secondaire |
| Équipements | 2 | Secondaire |

Le "même modèle" n'apparaît pas dans ce tableau : c'est un prérequis geré
en amont, pas un critère noté. Une donnée manquante d'un côté ou de
l'autre reçoit un score partiel documenté (jamais 0 sec, jamais 100
supposé) — l'incertitude qui en résulte est répercutée sur la confiance,
jamais sur le score lui-même. Voir les commentaires de
`comparable-score.ts` pour le détail des barèmes (écarts d'année, de
kilométrage, de puissance...).

## Pondération

Le poids d'un comparable est proportionnel au **carré** de son score de
similarité, puis normalisé pour que la somme des poids utilisés vaille 1.
Élever au carré fait qu'un comparable à 96/100 pèse nettement plus qu'un
comparable à 55/100 (rapport ~3× plutôt que ~1,75× avec une pondération
linéaire), ce qui correspond à la demande explicite de la spec.

## Valeurs aberrantes

Détection par **MAD (Median Absolute Deviation)** : médiane des prix, puis
écart absolu médian autour de cette médiane. Le "modified z-score"
(`0.6745 × (prix − médiane) / MAD`) est comparé à un seuil de 3.5. Le MAD
est préféré à un écart-type classique car il est beaucoup moins sensible
aux valeurs extrêmes qu'il doit justement détecter. Avec moins de 4
comparables utilisables, la détection est désactivée (statistiquement peu
fiable sur un si petit échantillon) plutôt que de risquer des faux positifs.

## Fourchette basse / estimée / haute

La largeur de la fourchette est basée sur l'écart-type pondéré des prix
des comparables réellement utilisés, borné entre 4 % (fourchette
minimale, même avec des comparables parfaitement homogènes) et 20 %
(fourchette maximale) de la valeur estimée. Avec moins de deux comparables
utilisables, l'écart-type n'a pas de sens : la fourchette maximale (20 %)
est utilisée par défaut, ce qui reflète honnêtement l'incertitude plutôt
que d'afficher une fausse précision.

## Niveau de confiance

`faible` / `moyenne` / `elevee` (mêmes valeurs que `RiskLevel` ailleurs
dans le code, pour rester cohérent). Calculé à partir du **minimum** de
trois niveaux intermédiaires (nombre de comparables utilisés, similarité
moyenne, dispersion des prix), puis dégradé d'un cran supplémentaire si
des données importantes sont manquantes (puissance, finition, recherche
élargie à la marque...). Le moteur explique toujours sa confiance via
`confidenceReasons` (jamais une boîte noire — spec §22).

## Ajustements

Quatre ajustements, chacun optionnel et documenté séparément dans
`adjustments.ts` :

- **Kilométrage** et **Année** : taux fixes (`MILEAGE_RATE_PER_KM`,
  `YEAR_RATE_PER_YEAR`) comparant le véhicule cible à la moyenne pondérée
  des comparables utilisés. Volontairement simples pour cette V1 ; conçus
  pour être remplacés par des coefficients par modèle ou un modèle
  statistique sans changer l'architecture.
- **Finition** (`TrimAdjustmentProvider`) et **Équipements**
  (`OptionAdjustmentProvider`) : interfaces pluggables, avec une
  implémentation `Demo*` couvrant volontairement peu de cas, pour
  démontrer à la fois le chemin "coefficient trouvé" et le chemin "aucune
  donnée fiable -> aucun ajustement inventé".

## Valeur saine / actuelle / après réparation — éviter le double comptage

- **Valeur saine** (`healthyValue`) : résultat brut du moteur, en
  supposant un véhicule sans les problèmes déclarés.
- **Valeur actuelle** (`currentValue`) : valeur saine moins un
  **stigmate de marché** (perte de confiance de l'acheteur), calculé
  uniquement pour les catégories `accident` et `mecanique_majeure`
  (`MARKET_STIGMA_RATE`). Les catégories d'usure/carrosserie mineure
  n'ont **aucun** stigmate séparé : leur coût de réparation (calculé par
  `lib/calculations/repair-cost.ts`, totalement indépendant) suffit à
  expliquer l'écart de valeur. Additionner les deux aurait compté deux
  fois la même perte.
- **Valeur après remise en état** (`afterRepairValue`) : égale à la valeur
  saine, par hypothèse (une fois réparé, le véhicule redevient comparable
  aux comparables sains utilisés).

## Limites actuelles (V1)

- Les comparables sont supposés être en état "sain" sauf mention
  contraire — aucune pondération automatique de leur propre état.
- Les taux de kilométrage/année/stigmate de marché sont des constantes
  globales documentées, pas des coefficients par modèle.
- Pas de persistance en base de la richesse de l'estimation (comparables,
  ajustements, méthodologie) : seules `low/estimated/high` sont
  actuellement stockées dans `analyses` (voir `lib/analysis/analyze-listing.ts`).
- Le seuil de similarité minimal (40/100) et les seuils de confiance sont
  des constantes V1, à recalibrer avec de vraies données.
