import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

// Sınıf sil
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("siniflar")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "Sınıf silinirken hata oluştu." },
      { status: 500 }
    );
  }
}
