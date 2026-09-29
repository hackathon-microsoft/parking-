import { NextResponse } from "next/server";
import { malls } from "@/lib/data/malls";
import { countAvailable, getLiveSpots } from "@/lib/parking-state";

export async function GET() {
  const payload = malls.map((mall) => ({
    ...mall,
    totalSpots: getLiveSpots(mall.id).length,
    availableSpots: countAvailable(mall.id),
  }));

  return NextResponse.json({ malls: payload });
}
