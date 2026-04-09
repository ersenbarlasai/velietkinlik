import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Kademe listesi (sınıflar ile)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("kademeler")
      .select(`
        *,
        siniflar (*)
      `)
      .order("ad", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, message: "Kademeler yüklenirken hata oluştu." },
      { status: 500 }
    );
  }
}

// Yeni kademe
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ad } = body;

    if (!ad) {
      return NextResponse.json(
        { success: false, message: "Kademe adı gereklidir." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("kademeler")
      .insert({ ad })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Kademe oluşturulurken hata oluştu." },
      { status: 500 }
    );
  }
}
