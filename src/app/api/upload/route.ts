import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Admin client for server-side operations
const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "파일이 없습니다." },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];
    const allowedAudioTypes = ["audio/mpeg", "audio/mp3", "audio/x-mp3"];

    const isImage = allowedImageTypes.includes(file.type);
    const isVideo = allowedVideoTypes.includes(file.type);
    const isAudio = allowedAudioTypes.includes(file.type) || file.name.endsWith(".mp3");

    if (!isImage && !isVideo && !isAudio) {
      return NextResponse.json(
        { error: "이미지, 영상, 또는 MP3 파일만 업로드 가능합니다." },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = isImage ? 5 * 1024 * 1024 : isAudio ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: isImage ? "이미지는 5MB 이하만 가능합니다." : isAudio ? "음악은 10MB 이하만 가능합니다." : "영상은 50MB 이하만 가능합니다." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const folder = isImage ? "images" : isAudio ? "audio" : "videos";

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("portfolio-media")
      .upload(`${folder}/${fileName}`, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Storage upload error:", error);
      return NextResponse.json(
        { error: "업로드에 실패했습니다." },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("portfolio-media")
      .getPublicUrl(`${folder}/${fileName}`);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      type: isImage ? "image" : "video",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get("url");

    if (!fileUrl) {
      return NextResponse.json(
        { error: "파일 URL이 없습니다." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    
    // Extract path from URL
    const urlParts = fileUrl.split("/storage/v1/object/public/portfolio-media/");
    if (urlParts.length < 2) {
      return NextResponse.json(
        { error: "유효하지 않은 URL입니다." },
        { status: 400 }
      );
    }

    const filePath = urlParts[1];

    // Delete from Storage
    const { error } = await supabase.storage
      .from("portfolio-media")
      .remove([filePath]);

    if (error) {
      console.error("Storage delete error:", error);
      return NextResponse.json(
        { error: "삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}