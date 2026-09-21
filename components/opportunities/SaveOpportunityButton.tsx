"use client";

import { useEffect, useState } from "react";
import {
  readSavedListingIds,
  subscribeSavedListings,
  toggleSavedListing,
} from "@/lib/favorites/local-favorites";

export default function SaveOpportunityButton({ listingId }: { listingId: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = (ids: string[]) => setSaved(ids.includes(listingId));
    sync(readSavedListingIds());
    return subscribeSavedListings(sync);
  }, [listingId]);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleSavedListing(listingId);
      }}
      aria-pressed={saved}
      aria-label={saved ? "Retirer l'opportunité des sauvegardes" : "Sauvegarder l'opportunité"}
      className={`absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/70 text-slate-400 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md transition-all duration-500 ease-out hover:-translate-y-0.5 hover:text-cyan-700 hover:shadow-[0_10px_24px_rgba(6,182,212,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 ${saved ? "text-cyan-700" : ""}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.5 4.75h11a1 1 0 0 1 1 1v13.1a.6.6 0 0 1-.94.5L12 15.4l-5.56 3.95a.6.6 0 0 1-.94-.5V5.75a1 1 0 0 1 1-1Z"
          className={saved ? "text-cyan-700" : undefined}
        />
      </svg>
    </button>
  );
}
