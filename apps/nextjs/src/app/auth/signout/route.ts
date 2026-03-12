import { NextResponse } from "next/server";
import { clearSession } from "~/shared/lib/session";

export async function GET(request: Request) {
  await clearSession();

  return NextResponse.redirect(new URL("/", request.url));
}

export async function POST() {
  await clearSession();

  return NextResponse.json({ success: true });
}
