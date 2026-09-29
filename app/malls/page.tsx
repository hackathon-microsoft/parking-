"use client";

import { useEffect, useState } from "react";
import { MallCard } from "@/components/MallCard";
import { PageShell } from "@/components/PageShell";
import { fetchMalls } from "@/lib/api-client";
import type { Mall } from "@/lib/types";

export default function MallSelectionPage() {
  const [malls, setMalls] = useState<Mall[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMalls()
      .then(setMalls)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load malls"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell
      eyebrow="Mall selection"
      title="Where are you parking?"
      subtitle="Choose a mall to open its simulated parking map. Use Inorbit Mall for the main demonstration."
    >
      {error ? <p className="text-red-300">{error}</p> : null}
      {loading ? <p className="text-muted">Loading malls...</p> : null}
      <div className="grid gap-5 md:grid-cols-3">
        {malls.map((mall) => (
          <MallCard key={mall.id} mall={mall} />
        ))}
      </div>
    </PageShell>
  );
}
