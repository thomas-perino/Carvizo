import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-[var(--color-text)]">Page introuvable</h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        Cette annonce ou cette page n&apos;existe pas (ou plus).
      </p>
      <Link
        href="/opportunites"
        className="mt-6 rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary-strong)]"
      >
        Voir les opportunités
      </Link>
    </div>
  );
}
