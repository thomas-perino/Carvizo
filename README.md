# Carvizo

Carvizo est une plateforme SaaS de détection d'opportunités d'achat-revente
de véhicules d'occasion. Pour chaque annonce, elle estime la valeur de
marché, le coût total d'acquisition (carte grise, transport, réparations,
préparation, imprévus), le bénéfice potentiel sur trois scénarios, et
combine le tout en un **Deal Score** explicable sur 100.

> ⚠️ **Cette version fonctionne exclusivement avec des données de
> démonstration fictives.** Aucune des 15 annonces visibles dans
> l'application ne correspond à un véhicule réellement en vente. Voir
> [Ce qui reste à faire](#ce-qui-reste-à-faire).

---

## Sommaire

- [Architecture](#architecture)
- [Stack technique](#stack-technique)
- [Installation locale](#installation-locale)
- [Configuration Supabase](#configuration-supabase)
- [Variables d'environnement](#variables-denvironnement)
- [Lancer le projet](#lancer-le-projet)
- [Structure des dossiers](#structure-des-dossiers)
- [Moteur de calcul](#moteur-de-calcul)
- [Market Value Engine](#market-value-engine)
- [Deal Score](#deal-score)
- [Ajouter une nouvelle source d'annonces](#ajouter-une-nouvelle-source-dannonces)
- [Tests](#tests)
- [Ce qui reste à faire](#ce-qui-reste-à-faire)

---

## Architecture

```text
Listing Sources (Le Bon Coin, La Centrale, AutoScout24, ... — futures)
      ↓
Source Adapter          lib/sources/*.ts        (implémente ListingSource)
      ↓
Raw Listing             lib/sources/types.ts    (forme brute, texte)
      ↓
Normalized Listing      lib/sources/normalize.ts (Vehicle / Listing typés)
      ↓
Vehicle / Listing       types/index.ts
      ↓
Analysis Engine         lib/analysis/analyze-listing.ts
 ┌────────────────┬──────────────────┐
 │                │                  │
Calculations   Market Value      IA (future étape,
lib/calculations/* Engine         non implémentée)
                lib/market-value/*
 │                │                  │
 └────────┬───────┴──────────────────┘
          ↓
   Deal Score          lib/calculations/deal-score.ts
          ↓
   User Interface       app/, components/
```

**Principe fondamental (voir spec §5) : les calculs financiers et le Deal
Score ne dépendent jamais d'une réponse d'IA.** Le dossier
`lib/calculations/` ne connaît que des nombres ; `lib/market-value/` (le
**Market Value Engine**, voir section dédiée ci-dessous) estime la valeur
de marché à partir de véhicules comparables, également sans IA ;
`lib/analysis/` orchestre ces deux modules à partir de "signaux"
(`AnalysisSignals`) qui, aujourd'hui, sont saisis à la main dans les
données de démo (profil du véhicule cible, pool de comparables, points
d'état), et qui proviendront demain de modules d'ingestion réels et d'un
module d'IA — sans que le moteur de calcul ni le Market Value Engine
n'aient jamais à changer.

Seule la source **"demo"** est implémentée actuellement (aucun scraping
réel n'a été développé, volontairement — voir spec §4 et §14). Elle
traverse néanmoins tout le pipeline ci-dessus (`RawListing` →
normalisation → `Vehicle`/`Listing` → analyse), afin que brancher une
vraie source plus tard ne nécessite de modifier aucune autre couche.

## Stack technique

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **Supabase / PostgreSQL** (`@supabase/supabase-js`)
- **Vitest** pour les tests unitaires
- Déploiement visé : **Vercel** + **Supabase** + **GitHub**

## Installation locale

```bash
npm install
npm run dev
```

L'application est utilisable **immédiatement**, sans aucune configuration :
tant que Supabase n'est pas configuré (voir ci-dessous), toutes les pages
utilisent le jeu de données de démonstration généré en mémoire.

## Configuration Supabase

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Dans l'éditeur SQL du projet, exécuter le contenu de
   [`supabase/schema.sql`](./supabase/schema.sql) (tables, contraintes,
   index, RLS).
3. Copier `.env.example` vers `.env.local` et renseigner les clés du
   projet (Project Settings → API).
4. (Optionnel) Peupler la base avec les données de démonstration :

   ```bash
   npm run seed
   ```

   Ce script réutilise le même pipeline (source → normalisation → moteur
   d'analyse) que le mode démo en mémoire, puis insère le résultat dans
   Supabase — utile pour tester le schéma avec de vraies requêtes.

Sans étape 3, l'application continue de fonctionner sur les données de
démonstration en mémoire (utile en développement ou pour une preview
Vercel sans base de données).

## Variables d'environnement

Voir [`.env.example`](./.env.example) :

| Variable | Usage |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique, utilisable côté navigateur |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé privée, **serveur uniquement**, jamais exposée au client |

Ne jamais committer de vraies clés : `.env*` est déjà ignoré par Git.

## Lancer le projet

```bash
npm run dev      # serveur de développement
npm run build    # build de production
npm run start    # sert le build de production
npm run test     # exécute la suite de tests (Vitest)
npm run lint     # ESLint
npm run seed     # peuple un projet Supabase réel avec les données de démo
```

## Structure des dossiers

```text
app/                        Pages (App Router)
  page.tsx                    /
  opportunites/page.tsx        /opportunites
  opportunites/[id]/page.tsx   /opportunites/[id]

components/
  layout/                    Navbar, Footer
  ui/                        DealScore, RiskBadge, ProfitDisplay,
                             CostBreakdown, ScenarioCard, RepairList,
                             MarketValueDisplay, ValueEstimateCard,
                             MarketValueMethodology
  opportunities/             VehicleCard, OpportunityGrid, FilterPanel

lib/
  calculations/              Modules de calcul purs et testables
                             (registration, repair-cost, risk, market,
                             profit, roi, deal-score, deal-score-explain)
  market-value/              Market Value Engine : estimation de la valeur
                             de marché à partir de comparables (voir
                             section dédiée + lib/market-value/README.md)
  analysis/                  Moteur d'analyse : combine calculations +
                             Market Value Engine + signaux en une
                             Analysis complète
  sources/                   Abstraction ListingSource, normalisation,
                             source "demo"
  supabase/                  Clients Supabase, types de lignes, mappers
  data/                      Couche d'accès aux données (Supabase ou
                             démo), filtres et tri
  format.ts, labels.ts       Aides d'affichage (devises, libellés FR)

types/index.ts               Types de domaine (Vehicle, Listing, Analysis...)
data/demo/seed.ts            Les 15 annonces fictives de démonstration
data/demo/comparables.ts     Pool de véhicules comparables DEMO pour le
                             Market Value Engine
supabase/schema.sql          Schéma PostgreSQL complet + RLS
scripts/seed-supabase.ts     Script de peuplement d'un vrai projet Supabase
tests/                       Tests Vitest (calculs, Market Value Engine,
                             moteur d'analyse, sources)
```

## Moteur de calcul

Toutes les formules sont dans `lib/calculations/` et testées dans `tests/calculations/`.

```text
Investissement total =
  Prix d'achat
  + Carte grise
  + Transport
  + Réparations (estimation médiane)
  + Préparation
  + Imprévus

Profit(scénario) = Prix de revente(scénario) − Investissement total

ROI = Profit / Investissement total × 100
```

- **Carte grise** (`registration.ts`) : tarif approximatif du cheval fiscal
  par région + frais fixes ; exonération totale pour les véhicules
  électriques, abattement de 50 % pour les hybrides (approximation
  simplifiée, à affiner avec des données officielles).
- **Réparations** (`repair-cost.ts`) : agrège une liste de réparations en
  fourchette basse/haute/estimée, et calcule un score "état" (0-100).
- **Risque** (`risk.ts`) : règles déterministes (accident déclaré,
  réparation mécanique majeure à risque élevé, kilométrage très élevé...)
  → `faible` / `moyen` / `eleve`. Jamais une estimation arbitraire.
- **Décote marché** (`market.ts`) : écart en € et en % entre le prix
  demandé et la **valeur actuelle** du véhicule (voir Market Value Engine
  ci-dessous — pas une valeur "saine" théorique, mais la valeur qui tient
  compte de l'état réel de cette annonce précise).
- **Imprévus** : 3 % du prix d'achat par défaut (`DEFAULT_UNEXPECTED_COST_RATE`).

> Historique : avant l'introduction du Market Value Engine, `marketValueLow/
> Estimated/High` étaient saisis à la main dans les données de démo. Ils
> sont désormais calculés par `lib/market-value/` à partir d'un profil de
> véhicule cible et d'un pool de comparables — voir section suivante.

## Market Value Engine

`lib/market-value/` estime la valeur d'un véhicule en le comparant à des
véhicules réellement similaires (comme le ferait un professionnel de la
reprise), pas par une simple moyenne des prix du même modèle. Il est
indépendant de l'UI, de Supabase, des sources et de l'IA, et peut être
testé isolément (`tests/market-value/`).

En bref :

1. **Sélection des comparables** — filtre obligatoire marque + modèle,
   puis score de similarité (0-100) sur génération, motorisation,
   carburant, transmission, année, kilométrage, finition, état,
   localisation et équipements.
2. **Valeurs aberrantes** — détection par MAD (Median Absolute
   Deviation), plus robuste qu'un écart-type classique.
3. **Pondération** — moyenne pondérée par le **carré** du score de
   similarité : les comparables les plus proches comptent nettement plus.
4. **Ajustements** — kilométrage, année (taux documentés), finition et
   équipements (fournisseurs `TrimAdjustmentProvider` /
   `OptionAdjustmentProvider`, avec des exemples DEMO volontairement
   partiels — aucune valeur n'est jamais inventée pour une finition
   inconnue).
5. **Fourchette et confiance** — largeur de fourchette basée sur la
   dispersion réelle des comparables (4 % à 20 % de la valeur estimée) ;
   confiance `faible` / `moyenne` / `elevee`, toujours expliquée
   (`confidenceReasons`).
6. **Valeur saine / actuelle / après réparation** — `analyzeVehicleValue`
   distingue la valeur d'un véhicule sain, sa valeur actuelle compte tenu
   de son état déclaré (stigmate de marché, uniquement pour les problèmes
   d'accident ou de mécanique majeure — jamais un double comptage avec le
   coût de réparation), et sa valeur après remise en état.

Le détail complet (barèmes exacts, formules, limites connues) est
documenté dans [`lib/market-value/README.md`](./lib/market-value/README.md).

Données de démonstration : [`data/demo/comparables.ts`](./data/demo/comparables.ts)
fournit un pool de véhicules comparables volontairement hétérogène
(kilométrages/années variés, plusieurs finitions, valeurs aberrantes
intentionnelles, un pool réduit pour la BMW Série 1 afin d'illustrer le
cas "peu de comparables").

## Deal Score

Calculé dans `lib/calculations/deal-score.ts`, à partir de cinq
sous-scores pondérés (0-100 chacun) :

| Critère | Poids |
| --- | --- |
| Bénéfice potentiel | 30 % |
| Décote par rapport au marché | 20 % |
| Risque | 20 % |
| Facilité de revente | 15 % |
| État / réparations | 15 % |

Chaque sous-score est calculé par une fonction pure et déterministe
(`profitToScore`, `discountToScore`, `riskLevelToScore`, etc.) — **jamais
une valeur générée par une IA**. Les seuils de normalisation (ex : un
bénéfice de 4000 € = score de bénéfice maximal) sont des constantes
documentées dans le code, pensées comme une V1 ajustable.

`lib/calculations/deal-score-explain.ts` transforme ensuite ces
sous-scores en points positifs/négatifs lisibles (ex. *"Forte décote par
rapport au marché"*, *"Kilométrage légèrement élevé"*), affichés sur la
page de détail d'une opportunité.

**Intégration avec le Market Value Engine :** les pondérations ci-dessus
sont inchangées. Seule la source de la "décote marché" a changé : elle
compare désormais le prix demandé à la **valeur actuelle** du véhicule
(compte tenu de son état déclaré), et non plus à une valeur de marché
générique saisie à la main — une comparaison plus juste pour évaluer si
le prix affiché est intéressant compte tenu de l'état réel de CETTE
annonce. Le niveau de confiance de l'estimation n'est pas encore utilisé
dans le calcul du score lui-même (voir "Ce qui reste à faire").

## Ajouter une nouvelle source d'annonces

Voir [`lib/sources/README.md`](./lib/sources/README.md). En résumé :
implémenter l'interface `ListingSource`, l'ajouter à
`lib/sources/registry.ts`, et laisser `normalize.ts` /
`analyze-listing.ts` faire le reste. Aucun scraping ni contournement de
protection technique ne doit être implémenté — uniquement des sources
autorisées (API, flux, partenariat).

## Tests

```bash
npm run test
```

68 tests couvrant :

- calcul du bénéfice (cas positif, cas de marge négative) ;
- calcul du ROI (cas positif, négatif, investissement nul) ;
- calcul du Deal Score (bonne affaire, mauvaise affaire, bornes 0-100) ;
- agrégation des coûts de réparation et score d'état ;
- niveau de risque (aucune réparation, accident déclaré, problème
  mécanique majeur, kilométrage très élevé) ;
- le moteur d'analyse de bout en bout (`analyzeListing`), y compris un
  cas de marge négative et un cas de risque élevé ;
- le pipeline de normalisation d'une annonce brute ;
- **Market Value Engine** (`tests/market-value/`) : sélection des
  comparables (très/moyennement similaire, trop différent, recherche
  élargie à la marque), score de similarité (moteur, année, kilométrage,
  finition différents, données manquantes), pondération (un comparable
  très similaire pèse nettement plus), détection des valeurs aberrantes
  (avec l'exemple exact de la spec), niveau de confiance (nombreux
  comparables similaires, peu de comparables, forte dispersion, données
  manquantes), distinction valeur saine / actuelle / après réparation
  (y compris l'absence de double comptage pour une simple usure).

## Ce qui reste à faire

Volontairement exclu de cette étape (voir spec §14 et §25) : intégration
réelle de sources externes, authentification, favoris fonctionnels,
paiement, IA d'analyse de description/photos/OCR, vérification VIN
réelle, notifications, application mobile.

Spécifiquement pour le Market Value Engine (voir aussi
`lib/market-value/README.md`, section "Limites actuelles") : persistance
en base de la richesse de l'estimation (comparables, ajustements,
méthodologie — actuellement recalculée en mémoire pour les données de
démo, non stockée dans Supabase), utilisation du niveau de confiance dans
le calcul du Deal Score lui-même, coefficients de finition/équipements
par modèle plus complets, remplacement des taux kilométrage/année fixes
par des coefficients par modèle ou un modèle statistique.

Voir le compte rendu de fin d'étape fourni séparément pour le détail des
prochaines étapes recommandées.
