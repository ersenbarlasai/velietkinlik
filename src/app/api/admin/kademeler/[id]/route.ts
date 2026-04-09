import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

// Kademe sil
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("kademeler")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "Kademe silinirken hata oluştu." },
      { status: 500 }
    );
  }
}
