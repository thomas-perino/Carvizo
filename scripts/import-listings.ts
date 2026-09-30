import { readFile, writeFile } from "node:fs/promises";
import { parseListingImport, normalizeImport, MAX_IMPORT_BYTES } from "../lib/import/listings";
import { JsonFeedSource } from "../lib/sources/json-feed";
import { normalizeRawListing } from "../lib/sources/normalize";

async function main() {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) throw new Error("Usage : npm run import:listings -- <fichier.json|--feed> <sortie.json>");
  let normalized;
  if (input === "--feed") {
    if (!process.env.CARVIZO_FEED_URL) throw new Error("CARVIZO_FEED_URL manquant : aucun flux partenaire n’est configuré.");
    const source = new JsonFeedSource(process.env.CARVIZO_FEED_URL, process.env.CARVIZO_FEED_TOKEN);
    normalized = (await source.fetchListings()).map(normalizeRawListing);
  } else {
    const buffer = await readFile(input);
    if (buffer.byteLength > MAX_IMPORT_BYTES) throw new Error("Fichier trop volumineux : maximum 2 Mo.");
    const report = parseListingImport(buffer.toString("utf8"));
    if (report.errors.length) throw new Error(report.errors.map(e => `Ligne ${e.row} : ${e.message}`).join("\n"));
    const retrievedAt = new Date().toISOString();
    normalized = report.listings.map(v => normalizeImport(v, retrievedAt));
    console.log(`${report.duplicates} doublon(s) fusionné(s).`);
  }
  await writeFile(output, JSON.stringify({ importedAt: new Date().toISOString(), listings: normalized }, null, 2) + "\n", { flag: "wx" });
  console.log(`${normalized.length} annonce(s) normalisée(s). Pas d’insertion en base ni d’estimation fictive.`);
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Import impossible."); process.exitCode = 1; });
