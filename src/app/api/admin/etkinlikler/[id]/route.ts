import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

// Etkinlik güncelle
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from("etkinlikler")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, message: "Etkinlik güncellenirken hata oluştu." },
      { status: 500 }
    );
  }
}

// Etkinlik sil
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("etkinlikler")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`DELETE /api/admin/etkinlikler/${await params.then(p => p.id).catch(() => 'unknown')} HATA:`, errMsg);
    return NextResponse.json(
      { success: false, message: "Etkinlik silinirken hata oluştu.", error: errMsg },
      { status: 500 }
    );
  }
}
