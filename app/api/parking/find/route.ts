import { NextResponse } from "next/server";
import { DEMO_USER_ID } from "@/lib/constants";
import { getMemoryProvider } from "@/lib/memory";

export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId") ?? DEMO_USER_ID;
  const memory = await getMemoryProvider().recallParking(userId);
  return NextResponse.json({ memory });
}
