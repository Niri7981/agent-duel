import { NextResponse } from "next/server";

import { getArenaHome } from "@/lib/server/arena/get-arena-home";

export async function GET() {
  return NextResponse.json(await getArenaHome());
}
