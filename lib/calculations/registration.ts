import type { FuelType, Vehicle } from "@/types";

/**
 * Estimation du coût de la carte grise (certificat d'immatriculation).
 *
 * Le coût réel dépend du tarif régional du cheval fiscal (CV) et varie par
 * région française. Pour cette fondation, on utilise une table de tarifs
 * approximatifs par région et un tarif par défaut pour les autres cas.
 * Ces valeurs sont volontairement isolées ici pour être ajustées facilement
 * (ou remplacées par un appel à une source officielle) sans toucher au
 * reste du moteur de calcul.
 */

/** Tarif approximatif du cheval fiscal (en €) par région, 2026. */
const REGIONAL_RATE_PER_CV: Record<string, number> = {
  "Île-de-France": 46.15,
  "Auvergne-Rhône-Alpes": 43,
  "Provence-Alpes-Côte d'Azur": 51.2,
  "Occitanie": 44,
  "Nouvelle-Aquitaine": 41,
  "Hauts-de-France": 33,
  "Grand Est": 42,
  "Bretagne": 51,
  "Pays de la Loire": 48,
  "Normandie": 35,
};

const DEFAULT_RATE_PER_CV = 43;

/** Frais fixes (taxe de gestion + acheminement) indépendants du CV. */
const FIXED_FEES = 13.76;

export interface RegistrationCostInput {
  fiscalPower: number | null;
  fuelType: FuelType;
  location: string;
}

/**
 * Résout le tarif régional par CV à partir d'une localisation libre
 * (ex: "Lyon, Auvergne-Rhône-Alpes" ou juste "Auvergne-Rhône-Alpes").
 */
function resolveRatePerCv(location: string): number {
  const match = Object.keys(REGIONAL_RATE_PER_CV).find((region) =>
    location.toLowerCase().includes(region.toLowerCase())
  );
  return match ? REGIONAL_RATE_PER_CV[match] : DEFAULT_RATE_PER_CV;
}

/**
 * Calcule le coût estimé de la carte grise.
 *
 * - Véhicules électriques : exonération totale du tarif au CV dans la
 *   plupart des régions françaises -> seuls les frais fixes s'appliquent.
 * - Véhicules hybrides : abattement de 50 % dans de nombreuses régions.
 * - Essence / diesel : tarif plein.
 */
export function computeRegistrationCost(input: RegistrationCostInput): number {
  const { fiscalPower, fuelType, location } = input;

  if (!fiscalPower || fiscalPower <= 0) {
    return Math.round(FIXED_FEES);
  }

  const ratePerCv = resolveRatePerCv(location);

  let multiplier = 1;
  if (fuelType === "electrique") multiplier = 0;
  else if (fuelType === "hybride") multiplier = 0.5;

  const variableCost = fiscalPower * ratePerCv * multiplier;

  return Math.round(variableCost + FIXED_FEES);
}

export function computeRegistrationCostForVehicle(vehicle: Vehicle): number {
  return computeRegistrationCost({
    fiscalPower: vehicle.fiscalPower,
    fuelType: vehicle.fuelType,
    location: vehicle.location,
  });
}
