import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
};

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("settings")
      .select("key, value");

    if (error) throw error;

    const result: Record<string, string> = {};
    (data || []).forEach((row: { key: string; value: string }) => {
      result[row.key] = row.value;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "설정을 불러오는데 실패했습니다." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = getSupabaseAdmin();

    for (const [key, value] of Object.entries(body)) {
      const { error } = await supabase
        .from("settings")
        .upsert({ key, value }, { onConflict: "key" });
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "설정 저장에 실패했습니다." }, { status: 500 });
  }
}
