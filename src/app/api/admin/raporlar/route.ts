import { supabaseAdmin } from "@/lib/supabase-admin";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Filtrelenmiş kayıt listesi
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const etkinlik_id = searchParams.get("etkinlik_id");
    const saat_id = searchParams.get("saat_id");
    const saatStr = searchParams.get("saat");
    const kademe_id = searchParams.get("kademe_id");
    
    // ...

    let query = supabaseAdmin
      .from("kayitlar")
      .select(`
        *,
        kademeler (*),
        siniflar (
          *,
          kademeler (*)
        ),
        etkinlik_saatleri (
          *,
          etkinlikler (*)
        )
      `)
      .order("created_at", { ascending: false });

    // Filtreler
    if (saat_id) {
      query = query.eq("etkinlik_saati_id", saat_id);
    } else if (saatStr) {
      const { data: saatler } = await supabaseAdmin
        .from("etkinlik_saatleri")
        .select("id")
        .eq("saat", saatStr);
        
      if (saatler && saatler.length > 0) {
        query = query.in("etkinlik_saati_id", saatler.map(s => s.id));
      } else {
        query = query.in("etkinlik_saati_id", ["00000000-0000-0000-0000-000000000000"]); // return none
      }
    }

    if (etkinlik_id && !saat_id) {
      const { data: saatler } = await supabaseAdmin
        .from("etkinlik_saatleri")
        .select("id")
        .eq("etkinlik_id", etkinlik_id);

      if (saatler && saatler.length > 0) {
        query = query.in("etkinlik_saati_id", saatler.map((s) => s.id));
      } else {
        query = query.in("etkinlik_saati_id", ["00000000-0000-0000-0000-000000000000"]); // return none
      }
    }

    if (kademe_id) {
      query = query.eq("kademe_id", kademe_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, message: "Raporlar yüklenirken hata oluştu." },
      { status: 500 }
    );
  }
}
