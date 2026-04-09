import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

// Yeni sınıf oluştur
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { kademe_id, sinif_no, sube } = body;

    if (!kademe_id || !sinif_no || !sube) {
      return NextResponse.json(
        { success: false, message: "Kademe, sınıf numarası ve şube gereklidir." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("siniflar")
      .insert({ kademe_id, sinif_no, sube })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Sınıf oluşturulurken hata oluştu." },
      { status: 500 }
    );
  }
}
