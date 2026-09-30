import { MAX_IMPORT_BYTES, parseListingImport, toRawListing } from "@/lib/import/listings";
import type { ListingSource, RawListing } from "./types";

/** Configured partner endpoint only; never scrape marketplace HTML. Not registered until a source is obtained. */
export class JsonFeedSource implements ListingSource {
  name = "authorized-json-feed";

  constructor(private readonly url: string, private readonly token?: string, private readonly fetcher: typeof fetch = fetch) {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password)
      throw new Error("Le flux doit utiliser HTTPS sans identifiants dans l’URL.");
  }

  async fetchListings(): Promise<RawListing[]> {
    const response = await this.fetcher(this.url, {
      headers: { Accept: "application/json", ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}) },
      signal: AbortSignal.timeout(15000), redirect: "error", cache: "no-store",
    });
    if (!response.ok) throw new Error(`Flux indisponible (HTTP ${response.status}).`);
    if (!response.headers.get("content-type")?.toLowerCase().includes("application/json"))
      throw new Error("Le flux doit renvoyer du JSON, pas une page HTML.");
    if (!response.body) throw new Error("Réponse du flux vide.");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let bytes = 0;
    let body = "";
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > MAX_IMPORT_BYTES) throw new Error("Flux trop volumineux : maximum 2 Mo.");
        body += decoder.decode(value, { stream: true });
      }
      body += decoder.decode();
    } finally { await reader.cancel(); }
    const report = parseListingImport(body);
    if (report.errors.length) throw new Error(`Flux rejeté : ${report.errors.length} annonce(s) invalide(s). Première erreur ligne ${report.errors[0].row} : ${report.errors[0].message}`);
    const retrievedAt = new Date().toISOString();
    return report.listings.map(v => toRawListing(v, retrievedAt));
  }
}
