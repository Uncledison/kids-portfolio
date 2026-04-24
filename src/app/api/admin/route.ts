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
      .from("portfolio")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "데이터를 불러오는데 실패했습니다." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const supabase = getSupabaseAdmin();

    if (payload.is_representative && payload.category) {
      await supabase
        .from("portfolio")
        .update({ is_representative: false })
        .eq("category", payload.category)
        .eq("is_representative", true);
    }

    const { error } = await supabase.from("portfolio").insert([payload]);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "저장에 실패했습니다." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...payload } = await request.json();
    const supabase = getSupabaseAdmin();

    if (payload.is_representative && payload.category) {
      await supabase
        .from("portfolio")
        .update({ is_representative: false })
        .eq("category", payload.category)
        .eq("is_representative", true)
        .neq("id", id);
    }

    const { error } = await supabase.from("portfolio").update(payload).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "수정에 실패했습니다." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id가 없습니다." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("portfolio").delete().eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "삭제에 실패했습니다." }, { status: 500 });
  }
}
