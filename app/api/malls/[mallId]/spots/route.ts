import { NextResponse } from "next/server";
import { getMallById } from "@/lib/data/malls";
import { getLiveSpots } from "@/lib/parking-state";

export async function GET(
  _request: Request,
  context: { params: Promise<{ mallId: string }> },
) {
  const { mallId } = await context.params;

  if (!getMallById(mallId)) {
    return NextResponse.json({ error: "Mall not found" }, { status: 404 });
  }

  return NextResponse.json({ spots: getLiveSpots(mallId) });
}
