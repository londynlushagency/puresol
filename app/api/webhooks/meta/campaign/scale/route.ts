import { NextResponse } from "next/server";
import { readCampaigns } from "@/lib/meta/api/scaleCampaign"; // move your logic into lib

export async function GET() {
  try {
    await readCampaigns();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error running scaling job:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}