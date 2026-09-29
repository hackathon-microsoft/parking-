"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { findMyCar } from "@/lib/api-client";
import type { ParkingMemoryRecord } from "@/lib/types";

export default function ParkingConfirmationPage() {
  const [memory, setMemory] = useState<ParkingMemoryRecord | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    findMyCar()
      .then(setMemory)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load confirmation"));
  }, []);

  return (
    <PageShell
      eyebrow="Parking confirmation"
      title="Parking saved"
      subtitle="ParkIn stored this location in the local memory layer. Later, Find My Car will retrieve the same record."
    >
      {error ? <p className="mb-4 text-red-300">{error}</p> : null}
      {memory ? (
        <div className="max-w-xl rounded-[28px] border border-accent/30 bg-card p-6">
          <p className="text-sm text-muted">{memory.mallName}</p>
          <p className="mt-2 text-4xl font-semibold">{memory.spotId}</p>
          <p className="mt-2 text-lg text-accent">
            {memory.level} / {memory.section}
          </p>
        </div>
      ) : null}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/find" className="rounded-2xl bg-accent px-5 py-3 font-semibold text-[#062018]">
          Find My Car
        </Link>
        <Link href="/" className="rounded-2xl border border-line px-5 py-3 text-muted">
          Back home
        </Link>
      </div>
    </PageShell>
  );
}
