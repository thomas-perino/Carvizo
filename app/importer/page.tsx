import type { Metadata } from "next";
import ImportWorkspace from "@/components/import/ImportWorkspace";

export const metadata: Metadata = { title: "Mes annonces — Carvizo", description: "Importe tes annonces et simule les coûts et la marge d’un achat-revente." };

export default function ImportPage() { return <ImportWorkspace />; }
