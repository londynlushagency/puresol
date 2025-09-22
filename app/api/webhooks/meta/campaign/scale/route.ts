// app/api/webhooks/meta/campaign/scale/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { readCampaigns } from "@/lib/meta/api/scaleCampaign";

// Secure string compare to avoid timing attacks
function secureEqual(a: string, b: string) {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function GET(req: Request) {
  const incomingSecret = req.headers.get("x-meta-webbhook-secret") ?? "";
  const expected = process.env.META_WEBHOOK_SECRET ?? "";

  // Check shared secret
  if (!expected || !secureEqual(incomingSecret, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await readCampaigns();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error running scaling job:", err);
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}