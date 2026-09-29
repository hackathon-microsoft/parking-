"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { ParkingMap } from "@/components/ParkingMap";
import { fetchMallSpots, fetchMalls } from "@/lib/api-client";
import type { Mall, ParkingSpot } from "@/lib/types";

export default function ParkingMapPage() {
  const params = useParams<{ mallId: string }>();
  const mallId = params.mallId;
  const [mall, setMall] = useState<Mall | null>(null);
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetchMalls(), fetchMallSpots(mallId)])
      .then(([allMalls, liveSpots]) => {
        setMall(allMalls.find((item) => item.id === mallId) ?? null);
        setSpots(liveSpots);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load map"));
  }, [mallId]);

  return (
    <PageShell
      eyebrow="Parking map"
      title={mall?.name ?? "Parking map"}
      subtitle="Green spots are available and clickable. Grey spots are occupied and cannot be selected."
    >
      {error ? <p className="mb-4 text-red-300">{error}</p> : null}
      <div className="mb-6 flex flex-wrap gap-4 text-sm">
        <span className="rounded-full bg-available/15 px-3 py-1 text-available">Available</span>
        <span className="rounded-full bg-white/5 px-3 py-1 text-occupied">Occupied</span>
        <span className="rounded-full bg-white/5 px-3 py-1 text-muted">
          {spots.filter((spot) => spot.availability === "available").length} open now
        </span>
      </div>
      <ParkingMap mallId={mallId} spots={spots} />
    </PageShell>
  );
}
