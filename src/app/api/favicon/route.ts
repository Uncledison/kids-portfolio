import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "favicon_url")
      .single();

    if (data?.value) {
      return NextResponse.redirect(data.value);
    }
  } catch {}

  return NextResponse.redirect(new URL("/favicon.png", request.url));
}
