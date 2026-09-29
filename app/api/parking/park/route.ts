import { NextResponse } from "next/server";
import { DEMO_USER_ID } from "@/lib/constants";
import { getMallById } from "@/lib/data/malls";
import { getMemoryProvider } from "@/lib/memory";
import { getLiveSpot, setSpotAvailability } from "@/lib/parking-state";
import type { ParkRequest } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as ParkRequest;
  const userId = body.userId ?? DEMO_USER_ID;
  const { mallId, spotId } = body;

  if (!mallId || !spotId) {
    return NextResponse.json({ error: "mallId and spotId are required" }, { status: 400 });
  }

  const mall = getMallById(mallId);
  const spot = getLiveSpot(mallId, spotId);

  if (!mall || !spot) {
    return NextResponse.json({ error: "Mall or parking spot not found" }, { status: 404 });
  }

  if (spot.availability === "occupied") {
    return NextResponse.json({ error: "That parking spot is already occupied" }, { status: 409 });
  }

  const memory = await getMemoryProvider().rememberParking({
    userId,
    mallId,
    mallName: mall.name,
    spotId: spot.id,
    level: spot.level,
    section: spot.section,
    distanceFromEntranceMeters: spot.distanceFromEntranceMeters,
    parkedAt: new Date().toISOString(),
  });

  setSpotAvailability(mallId, spotId, "occupied");

  return NextResponse.json({ memory });
}
