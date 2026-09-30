# Import d’annonces — première étape

La page `/importer` accepte un fichier JSON ou une saisie manuelle. Les annonces
valides sont enregistrées dans ce navigateur après validation explicite. Elles
restent distinctes des 15 opportunités fictives. L’export permet une sauvegarde
ou un transfert vers un autre navigateur. Pas de synchronisation en base à ce stade.

Un exemple **fictif** est disponible dans `public/examples/carvizo-import-demo.json`.
Format : tableau d’annonces ou `{ "listings": [...] }`. Champs obligatoires :

| Champ | Format |
| --- | --- |
| source, externalId | Textes ; identité stable de l’annonce chez le fournisseur |
| url | Lien HTTP(S) de l’annonce, sans identifiants |
| make, model | Textes distincts, y compris les modèles composés |
| year, mileage | Nombres entiers ; kilométrage >= 0 |
| price | Nombre positif en euros, centimes acceptés |
| fuelType | essence, diesel, hybride, electrique |
| transmission | manuelle, automatique |
| sellerType | particulier, professionnel |
| location | Ville ou département |
| publishedAt | Date ISO avec fuseau horaire |

Champs facultatifs : version, description, horsepower, fiscalPower, images
(30 liens maximum). Les champs financiers externes sont ignorés. Une donnée
inconnue n’est pas convertie en estimation. Fichier limité à 2 Mo et 1 000 annonces.
La dernière ligne valide gagne pour un doublon `(source, externalId)` ; deux
sources restent distinctes. La déduplication d’un même véhicule entre sites et
la détection des annonces retirées ne sont pas encore implémentées.

## Simulation

Le prix de revente et les coûts sont des hypothèses renseignées par l’utilisateur.
Le coût total comprend achat, carte grise, transport, réparations, préparation,
stockage total et imprévus. La marge affichée est avant fiscalité. Il n’y a ni
estimation automatique des frais ni attribution de Deal Score aux imports.

## Import serveur d’un export autorisé

```bash
npm run import:listings -- mon-export.json /tmp/carvizo-normalized.json
```

Le fichier de sortie contient les objets `vehicle` / `listing` normalisés. La
commande refuse un fichier de sortie existant et rejette le lot si une ligne
est invalide. Elle n’insère rien en base et n’alimente pas les opportunités.

## Flux partenaire à brancher

`JsonFeedSource` implémente `ListingSource` et lit un endpoint HTTPS dans ce même
format. Authentification Bearer facultative, délai de 15 s, taille bornée,
redirections refusées. Le token reste dans l’environnement serveur :

```bash
# Renseigner CARVIZO_FEED_URL et, si nécessaire, CARVIZO_FEED_TOKEN
# dans l’environnement privé du serveur, jamais dans un fichier versionné.
npm run import:listings -- --feed /tmp/carvizo-normalized.json
```

Le connecteur n’est pas activé dans le registre par défaut. Aucun abonnement,
compte fournisseur ni accès aux marketplaces n’est créé. L’automatisation réelle
nécessitera un flux obtenu, ses règles de pagination et de retrait, la persistance
en base, un ordonnanceur et un journal de synchronisation.

## Pistes vérifiées le 30 septembre 2026

- https://developer.leboncoin.auto/ : API Argus pour référentiel et valorisation ;
  ne constitue pas à elle seule un accès au catalogue d’annonces Leboncoin.
- https://offre-pro.lacentrale.fr/ : offres professionnelles ; accès à un flux
  de lecture et droits d’affichage Carvizo non établis.
- https://carhunt.fr/api : API tierce annonçant six sources, essai de 7 jours et
  offre Business 99 €/mois. Les CGU générales interdisent la redistribution
  (https://carhunt.fr/cgu) : obtenir des conditions API autorisant précisément
  l’usage Carvizo avant tout engagement.

La piste choisie pour cette étape est **sans abonnement**. L’existence d’une API
payante ne confirme ni son exhaustivité ni le droit de republier ses données.

## Publication Sites

`npm run build:sites` crée un export statique du site : pages de démo et espace
d’import local. Cet export n’exécute aucun import serveur ni actualisation
planifiée. `npm run dev/build/start` conserve le fonctionnement Next.js habituel.
Quand un flux réel sera connecté, passer à un hébergement avec serveur et base.
