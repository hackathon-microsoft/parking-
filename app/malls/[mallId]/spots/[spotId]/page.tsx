"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { SpotFacts } from "@/components/SpotFacts";
import { fetchSpot, parkHere } from "@/lib/api-client";
import type { ParkingSpot } from "@/lib/types";

export default function SpotDetailsPage() {
  const params = useParams<{ mallId: string; spotId: string }>();
  const router = useRouter();
  const [spot, setSpot] = useState<ParkingSpot | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSpot(params.mallId, params.spotId)
      .then(setSpot)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load spot"));
  }, [params.mallId, params.spotId]);

  async function onPark() {
    if (!spot) {
      return;
    }
    setSaving(true);
    setError("");
    try {
      await parkHere(params.mallId, spot.id);
      router.push("/parked");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not save parking location");
      setSaving(false);
    }
  }

  return (
    <PageShell
      eyebrow="Parking spot details"
      title={spot ? `Spot ${spot.id}` : "Spot details"}
      subtitle="Review the simulated location, then save it with Park Here."
    >
      {error ? <p className="mb-4 text-red-300">{error}</p> : null}
      {spot ? (
        <div className="max-w-xl space-y-6">
          <SpotFacts spot={spot} />
          <button
            type="button"
            onClick={onPark}
            disabled={saving || spot.availability === "occupied"}
            className="w-full rounded-2xl bg-accent px-5 py-4 text-lg font-semibold text-[#062018] transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {spot.availability === "occupied" ? "Spot occupied" : saving ? "Saving..." : "Park Here"}
          </button>
        </div>
      ) : null}
    </PageShell>
  );
}
