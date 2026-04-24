import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
};

async function getStoredPassword(): Promise<string> {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "admin_password")
      .single();
    if (data?.value) return data.value;
  } catch {}
  return process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "";
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const stored = await getStoredPassword();
    return NextResponse.json({ success: password === stored });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json();
    const stored = await getStoredPassword();

    if (currentPassword !== stored) {
      return NextResponse.json({ error: "현재 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }
    if (!newPassword || newPassword.length < 4) {
      return NextResponse.json({ error: "새 비밀번호는 4자 이상이어야 합니다." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    await supabase
      .from("settings")
      .upsert({ key: "admin_password", value: newPassword }, { onConflict: "key" });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
