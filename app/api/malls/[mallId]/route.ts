import { NextResponse } from "next/server";
import { getMallById } from "@/lib/data/malls";
import { countAvailable, getLiveSpots } from "@/lib/parking-state";

export async function GET(
  _request: Request,
  context: { params: Promise<{ mallId: string }> },
) {
  const { mallId } = await context.params;
  const mall = getMallById(mallId);

  if (!mall) {
    return NextResponse.json({ error: "Mall not found" }, { status: 404 });
  }

  return NextResponse.json({
    mall: {
      ...mall,
      totalSpots: getLiveSpots(mall.id).length,
      availableSpots: countAvailable(mall.id),
    },
  });
}
