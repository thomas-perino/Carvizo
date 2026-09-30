"use client";

import { useMemo, useState, useSyncExternalStore, type FormEvent } from "react";
import { Upload, FileJson, Plus, ArrowUpRight, Download, Trash2, Database, Calculator } from "lucide-react";
import { formatCurrency, formatMileage } from "@/lib/format";
import { computeProfit, computeTotalInvestment } from "@/lib/calculations/profit";
import { listingKey, MAX_IMPORT_BYTES, mergeImports, parseListingImport, validateImportListing, type ImportListing, type ImportReport } from "@/lib/import/listings";

const STORAGE_KEY = "carvizo.imports.v1";
const EVENT = "carvizo-imports-changed";
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener(EVENT, callback); };
}
function snapshot() { try { return localStorage.getItem(STORAGE_KEY) ?? ""; } catch { return ""; } }
function save(listings: ImportListing[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ listings }));
  window.dispatchEvent(new Event(EVENT));
}
function download(listings: ImportListing[]) {
  const href = URL.createObjectURL(new Blob([JSON.stringify({ listings }, null, 2)], { type: "application/json" }));
  const link = document.createElement("a"); link.href = href; link.download = "carvizo-annonces.json"; link.click();
  URL.revokeObjectURL(href);
}

const costFields = [
  ["registrationCost", "Carte grise"], ["transportCost", "Transport"], ["repairCostEstimated", "Réparations"],
  ["preparationCost", "Préparation"], ["storageCost", "Stockage (total)"], ["unexpectedCost", "Imprévus"],
] as const;
type CostKey = typeof costFields[number][0];

function ProfitSimulator({ listing }: { listing: ImportListing }) {
  const [resale, setResale] = useState("");
  const [costs, setCosts] = useState<Record<CostKey, string>>({ registrationCost: "", transportCost: "0", repairCostEstimated: "0", preparationCost: "0", storageCost: "0", unexpectedCost: "0" });
  const ready = resale.trim() !== "" && Number(resale) > 0 && Number(resale) <= 10000000 && costFields.every(([key]) => costs[key].trim() !== "" && Number.isFinite(Number(costs[key])) && Number(costs[key]) >= 0 && Number(costs[key]) <= 10000000);
  const total = ready ? computeTotalInvestment({ purchasePrice: listing.price, registrationCost: Number(costs.registrationCost), transportCost: Number(costs.transportCost), repairCostEstimated: Number(costs.repairCostEstimated), preparationCost: Number(costs.preparationCost), storageCost: Number(costs.storageCost), unexpectedCost: Number(costs.unexpectedCost) }) : null;
  const profit = total === null ? null : computeProfit(Number(resale), total);
  return <details className="import-simulator">
    <summary><Calculator size={16} /> Simuler la marge</summary>
    <p className="import-muted">Renseigne tes hypothèses. La valeur de revente et les frais ne sont pas estimés automatiquement. Aucun calcul fiscal n’est inclus.</p>
    <div className="import-form-grid">
      <label>Revente envisagée (€)<input type="number" min="0.01" max="10000000" step="0.01" value={resale} onChange={e => setResale(e.target.value)} placeholder="À renseigner" /></label>
      {costFields.map(([key, label]) => <label key={key}>{label} (€)<input type="number" min="0" max="10000000" step="0.01" value={costs[key]} onChange={e => setCosts({ ...costs, [key]: e.target.value })} placeholder="À renseigner" /></label>)}
    </div>
    {profit === null ? <p className="import-muted">Renseigne la revente et la carte grise, puis vérifie chaque frais, y compris ceux à zéro.</p> : <div className="import-profit" aria-live="polite">
      <div><span>Coût total d’acquisition</span><strong>{formatCurrency(total!)}</strong></div>
      <div><span>Marge potentielle avant fiscalité</span><strong style={{ color: profit >= 0 ? "#34d399" : "#f87171" }}>{formatCurrency(profit)}</strong></div>
    </div>}
  </details>;
}

export default function ImportWorkspace() {
  const stored = useSyncExternalStore(subscribe, snapshot, () => "");
  const saved = useMemo(() => {
    if (!stored) return { listings: [] as ImportListing[], damaged: false };
    try { const report = parseListingImport(stored); return { listings: report.listings, damaged: report.errors.length > 0 }; }
    catch { return { listings: [] as ImportListing[], damaged: true }; }
  }, [stored]);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"file" | "manual">("file");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(25);
  const listings = saved.listings;
  const filtered = listings.filter(v => `${v.make} ${v.model} ${v.location} ${v.source}`.toLowerCase().includes(search.toLowerCase()));
  const sources = new Set(listings.map(v => v.source)).size;

  function storeIncoming(incoming: ImportListing[]) {
    if (saved.damaged) throw new Error("La collection enregistrée est endommagée. Exporte-la si nécessaire puis vide-la avant un nouvel import.");
    const existing = new Set(listings.map(listingKey));
    const updated = incoming.filter(v => existing.has(listingKey(v))).length;
    save(mergeImports(listings, incoming));
    setMessage(`${incoming.length - updated} annonce(s) ajoutée(s), ${updated} mise(s) à jour.`);
  }

  async function read(file?: File) {
    setError(""); setMessage(""); setReport(null);
    if (!file) return;
    setBusy(true);
    try {
      if (file.size > MAX_IMPORT_BYTES) throw new Error("Fichier trop volumineux : maximum 2 Mo.");
      setReport(parseListingImport(await file.text()));
    } catch (e) { setError(e instanceof Error ? e.message : "Lecture impossible."); }
    finally { setBusy(false); }
  }

  function manual(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const str = (key: string) => String(data.get(key) ?? "").trim();
    try {
      const url = new URL(str("url"));
      const listing = validateImportListing({
        source: str("source"), externalId: url.origin + url.pathname, url: url.href,
        make: str("make"), model: str("model"), version: str("version") || null,
        price: Number(str("price")), year: Number(str("year")), mileage: Number(str("mileage")),
        fuelType: str("fuelType"), transmission: str("transmission"), sellerType: str("sellerType"),
        location: str("location"), publishedAt: `${str("publishedAt")}T12:00:00Z`,
      });
      storeIncoming([listing]); form.reset();
    } catch (e) { setError(e instanceof Error ? e.message : "Saisie invalide."); }
  }

  return <div className="import-workspace">
    <div className="import-heading">
      <div className="import-eyebrow"><Database size={14} /> MES ANNONCES</div>
      <h1>Du véhicule à la marge.</h1>
      <p>Importe tes annonces, vérifie leurs données et chiffre ton projet d’achat-revente.</p>
      <div className="import-status"><span /> Récupération automatique en attente de source</div>
    </div>
    <div className="import-metrics">
      <div><strong>{listings.length}</strong><span>annonces enregistrées</span></div>
      <div><strong>{sources}</strong><span>sources dans ta collection</span></div>
      <div><strong>0 €</strong><span>abonnement ajouté par Carvizo</span></div>
    </div>
    <div className="import-columns">
      <section className="import-panel" aria-labelledby="import-title">
        <h2 id="import-title">Ajouter des annonces</h2>
        <div className="import-tabs">
          <button type="button" aria-pressed={tab === "file"} onClick={() => setTab("file")}><FileJson size={16} /> Fichier JSON</button>
          <button type="button" aria-pressed={tab === "manual"} onClick={() => setTab("manual")}><Plus size={16} /> Saisie manuelle</button>
        </div>
        {tab === "file" ? <>
          <label className="import-drop"><Upload size={32} /><strong>Choisir un fichier d’annonces</strong><span>JSON · 2 Mo maximum · 1 000 annonces</span><input aria-label="Fichier JSON d’annonces" type="file" accept=".json,application/json" disabled={busy} onChange={e => void read(e.target.files?.[0])} /></label>
          <a className="import-example" href="/examples/carvizo-import-demo.json" download><Download size={15} /> Télécharger un exemple fictif</a>
          <p className="import-muted">Les annonces doivent venir d’un export ou d’un flux que tu peux réutiliser. Les modèles et les prix sont vérifiés avant enregistrement.</p>
          {report && <div className="import-report" aria-live="polite">
            <strong>{report.listings.length} annonce(s) valide(s)</strong>
            <p>{report.errors.length} rejetée(s) · {report.duplicates} doublon(s) fusionné(s)</p>
            {report.errors.length > 0 && <ul>{report.errors.slice(0, 10).map(e => <li key={e.row}>Ligne {e.row} : {e.message}</li>)}{report.errors.length > 10 && <li>Et {report.errors.length - 10} autres erreurs.</li>}</ul>}
            <button className="import-primary" disabled={!report.listings.length} onClick={() => { setError(""); try { storeIncoming(report.listings); setReport(null); } catch (e) { setError(e instanceof Error ? e.message : "Enregistrement impossible."); } }}>Enregistrer les {report.listings.length} annonces valides</button>
          </div>}
        </> : <form onSubmit={manual}>
          <div className="import-form-grid">
            <label>Source<select name="source"><option value="leboncoin">Leboncoin</option><option value="lacentrale">La Centrale</option><option value="autre">Autre</option></select></label>
            <label>Lien de l’annonce<input name="url" type="url" required placeholder="https://…" /></label>
            <label>Marque<input name="make" required placeholder="Renault" /></label>
            <label>Modèle<input name="model" required placeholder="Clio" /></label>
            <label>Version (facultatif)<input name="version" placeholder="1.2 16V" /></label>
            <label>Prix d’achat (€)<input name="price" type="number" min="0.01" max="10000000" step="0.01" required /></label>
            <label>Année<input name="year" type="number" min="1900" max={new Date().getFullYear() + 1} required /></label>
            <label>Kilométrage<input name="mileage" type="number" min="0" max="2000000" step="1" required /></label>
            <label>Carburant<select name="fuelType" defaultValue="" required><option value="" disabled>Choisir</option><option value="essence">Essence</option><option value="diesel">Diesel</option><option value="hybride">Hybride</option><option value="electrique">Électrique</option></select></label>
            <label>Boîte<select name="transmission" defaultValue="" required><option value="" disabled>Choisir</option><option value="manuelle">Manuelle</option><option value="automatique">Automatique</option></select></label>
            <label>Vendeur<select name="sellerType" defaultValue="" required><option value="" disabled>Choisir</option><option value="particulier">Particulier</option><option value="professionnel">Professionnel</option></select></label>
            <label>Ville / département<input name="location" required /></label>
            <label>Date de publication<input name="publishedAt" type="date" required /></label>
          </div>
          <button className="import-primary" type="submit">Enregistrer le véhicule</button>
        </form>}
        {busy && <p role="status">Vérification du fichier…</p>}
        {error && <p className="import-error" role="alert">{error}</p>}
        {message && <p className="import-success" role="status">{message}</p>}
        {saved.damaged && <p className="import-error" role="alert">Des données enregistrées sont invalides. La collection n’est pas remplacée automatiquement.</p>}
      </section>
      <aside className="import-panel import-roadmap">
        <h2>Vers l’import automatique</h2>
        <ol><li><strong>Importer et valider</strong><span>Fichier ou saisie manuelle disponibles dès maintenant.</span></li><li><strong>Obtenir une source</strong><span>API ou flux partenaire à identifier. Aucun accès Leboncoin ou La Centrale connecté.</span></li><li><strong>Actualiser les annonces</strong><span>Planification, prix modifiés et annonces retirées à connecter au flux.</span></li><li><strong>Estimer la revente</strong><span>Vrais comparables à collecter pour remplacer tes hypothèses.</span></li></ol>
        <p className="import-muted">Ta collection reste dans ce navigateur. Exporte-la pour la conserver ou la transférer. Elle n’est pas synchronisée entre appareils.</p>
      </aside>
    </div>
    <section className="import-collection" aria-labelledby="collection-title">
      <div className="import-collection-heading"><h2 id="collection-title">Ta collection</h2><div className="import-actions"><button disabled={!listings.length} onClick={() => download(listings)}><Download size={15} /> Exporter</button><button disabled={!stored} onClick={() => { if (window.confirm("Vider toutes les annonces enregistrées dans ce navigateur ? Exporte-les d’abord si tu veux les conserver.")) { try { save([]); setMessage("Collection vidée."); } catch { setError("Impossible de vider la collection."); } } }}><Trash2 size={15} /> Vider</button></div></div>
      {listings.length > 0 && <label className="import-search">Rechercher<input type="search" value={search} onChange={e => { setSearch(e.target.value); setVisibleCount(25); }} placeholder="Marque, modèle, ville ou source" /></label>}
      {!listings.length ? <div className="import-empty"><CarIcon /><h3>Ton premier véhicule attend ici.</h3><p>Ajoute une annonce pour commencer. Les annonces de démonstration restent dans la page Opportunités.</p></div> : <>
        <div className="import-listings">{filtered.slice(0, visibleCount).map(v => <article className="import-vehicle" key={listingKey(v)}>
          <div className="import-vehicle-header"><div><span className="import-source">{v.source === "demo" ? "DÉMONSTRATION FICTIVE" : v.source}</span><h3>{v.make} {v.model}</h3><p>{v.version || "Version non renseignée"}</p></div><strong>{formatCurrency(v.price)}</strong></div>
          <p className="import-vehicle-meta">{v.year} · {formatMileage(v.mileage)} · {v.location}</p>
          <a href={v.url} target="_blank" rel="noopener noreferrer">Voir l’annonce d’origine <ArrowUpRight size={14} /></a>
          <ProfitSimulator listing={v} />
        </article>)}</div>
        {!filtered.length && <p className="import-muted">Aucune annonce ne correspond à ta recherche.</p>}
        {filtered.length > visibleCount && <button className="import-primary" onClick={() => setVisibleCount(n => n + 25)}>Afficher 25 annonces de plus</button>}
      </>}
    </section>
  </div>;
}

function CarIcon() { return <Database size={36} strokeWidth={1.3} />; }
