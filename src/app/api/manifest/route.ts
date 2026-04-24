import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;
  let faviconUrl = `${origin}/favicon.png`;
  let childName = "성장일기";

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data } = await supabase.from("settings").select("key, value");
    const settings: Record<string, string> = {};
    (data || []).forEach((row: { key: string; value: string }) => {
      settings[row.key] = row.value;
    });
    if (settings.favicon_url) faviconUrl = settings.favicon_url;
    if (settings.child_name) childName = settings.child_name;
  } catch {}

  const manifest = {
    name: `${childName} 성장일기`,
    short_name: childName || "성장일기",
    description: "아이의 성장 과정을 기록한 포트폴리오",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    orientation: "portrait",
    icons: [
      { src: faviconUrl, sizes: "192x192", type: "image/png", purpose: "any maskable" },
      { src: faviconUrl, sizes: "512x512", type: "image/png", purpose: "any maskable" },
    ],
  };

  return NextResponse.json(manifest, {
    headers: { "Content-Type": "application/manifest+json" },
  });
}
