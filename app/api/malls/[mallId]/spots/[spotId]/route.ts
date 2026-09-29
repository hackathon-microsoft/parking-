import { NextResponse } from "next/server";
import { getLiveSpot } from "@/lib/parking-state";

export async function GET(
  _request: Request,
  context: { params: Promise<{ mallId: string; spotId: string }> },
) {
  const { mallId, spotId } = await context.params;
  const spot = getLiveSpot(mallId, spotId);

  if (!spot) {
    return NextResponse.json({ error: "Parking spot not found" }, { status: 404 });
  }

  return NextResponse.json({ spot });
}
