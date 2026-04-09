import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

// Saat sil
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; saatId: string }> }
) {
  try {
    const { saatId } = await params;

    const { error } = await supabaseAdmin
      .from("etkinlik_saatleri")
      .delete()
      .eq("id", saatId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "Saat silinirken hata oluştu." },
      { status: 500 }
    );
  }
}

// Saat güncelle (kapasite değişikliği)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; saatId: string }> }
) {
  try {
    const { saatId } = await params;
    const body = await request.json();
    const { kapasite } = body;

    const numKapasite = Number(kapasite);
    if (!kapasite || isNaN(numKapasite) || numKapasite < 1) {
      return NextResponse.json(
        { success: false, message: "Geçerli bir kapasite belirtilmelidir." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("etkinlik_saatleri")
      .update({ kapasite: numKapasite })
      .eq("id", saatId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "Kapasite güncellenirken hata oluştu." },
      { status: 500 }
    );
  }
}
