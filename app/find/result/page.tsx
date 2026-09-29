"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { findMyCar } from "@/lib/api-client";
import type { ParkingMemoryRecord } from "@/lib/types";

function formatTime(value: string): string {
  return new Date(value).toLocaleString();
}

export default function CarLocationResultPage() {
  const [memory, setMemory] = useState<ParkingMemoryRecord | null>(null);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    findMyCar()
      .then(setMemory)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not find your car"))
      .finally(() => setLoaded(true));
  }, []);

  return (
    <PageShell
      eyebrow="Car location result"
      title="Here is your car"
      subtitle="This result comes from the local memory provider. Later it will come from Vectorize Hindsight."
    >
      {error ? <p className="mb-4 text-red-300">{error}</p> : null}
      {loaded && !memory ? (
        <p className="text-muted">No parking location has been saved yet. Park at an available spot first.</p>
      ) : null}
      {memory ? (
        <div className="max-w-xl rounded-[28px] border border-line bg-card p-8">
          <p className="text-sm uppercase tracking-wide text-muted">{memory.mallName}</p>
          <p className="mt-3 text-5xl font-semibold">{memory.spotId}</p>
          <p className="mt-3 text-2xl text-accent">
            {memory.level} / {memory.section}
          </p>
          <p className="mt-4 text-sm text-muted">
            {memory.distanceFromEntranceMeters} m from the mall entrance
          </p>
          <p className="mt-1 text-sm text-muted">Saved at {formatTime(memory.parkedAt)}</p>
        </div>
      ) : null}
      <Link href="/" className="mt-8 inline-block text-sm text-accent hover:underline">
        Return home
      </Link>
    </PageShell>
  );
}
