import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

// Etkinliğe saat ekle
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { saat, kapasite } = body;

    if (!saat || !kapasite) {
      return NextResponse.json(
        { success: false, message: "Saat ve kapasite gereklidir." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("etkinlik_saatleri")
      .insert({
        etkinlik_id: id,
        saat,
        kapasite: Number(kapasite),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Saat eklenirken hata oluştu." },
      { status: 500 }
    );
  }
}
