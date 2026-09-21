import type {
  Difficulty,
  FuelType,
  InvestmentMode,
  OpportunitySortKey,
  RepairCategory,
  RepairIssueFilter,
  RiskLevel,
  SellerType,
  Transmission,
} from "@/types";
import type { ConfidenceLevel } from "@/lib/market-value/types";

export const riskLevelLabels: Record<RiskLevel, string> = {
  faible: "Risque faible",
  moyen: "Risque modéré",
  eleve: "Risque élevé",
};

export const difficultyLabels: Record<Difficulty, string> = {
  facile: "Facile",
  moyenne: "Moyenne",
  difficile: "Difficile",
};

export const fuelTypeLabels: Record<FuelType, string> = {
  essence: "Essence",
  diesel: "Diesel",
  hybride: "Hybride",
  electrique: "Électrique",
};

export const transmissionLabels: Record<Transmission, string> = {
  manuelle: "Manuelle",
  automatique: "Automatique",
};

export const sellerTypeLabels: Record<SellerType, string> = {
  particulier: "Particulier",
  professionnel: "Professionnel",
};

export const repairCategoryLabels: Record<RepairCategory, string> = {
  usure: "Usure / entretien",
  carrosserie: "Carrosserie",
  electrique: "Électrique",
  mecanique_majeure: "Mécanique majeure",
  accident: "Accident",
};

export const investmentModeLabels: Record<InvestmentMode, string> = {
  arbitrage: "Arbitrage immédiat",
  reparations: "Projets de réparation",
};

export const investmentModeDescriptions: Record<InvestmentMode, string> = {
  arbitrage: "Véhicules sains vendus sous leur cote, pour un bénéfice direct.",
  reparations: "Véhicules décotés à remettre en état, marge après travaux.",
};

export const repairIssueLabels: Record<RepairIssueFilter, string> = {
  moteur: "Moteur",
  carrosserie: "Carrosserie",
  interieur: "Intérieur",
};

export const sortLabels: Record<OpportunitySortKey, string> = {
  deal_score: "Meilleur Deal Score",
  profit: "Bénéfice estimé",
  roi: "ROI",
  price: "Prix",
  market_discount: "Décote marché",
};

export const confidenceLevelLabels: Record<ConfidenceLevel, string> = {
  faible: "Faible",
  moyenne: "Moyenne",
  elevee: "Élevée",
};
