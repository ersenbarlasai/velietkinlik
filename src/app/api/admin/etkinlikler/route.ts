import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Tüm etkinlikleri listele (saatleri ve doluluk bilgisi ile)
export async function GET() {
  try {
    const { data: etkinlikler, error } = await supabaseAdmin
      .from("etkinlikler")
      .select(`
        *,
        etkinlik_saatleri (
          *,
          kayitlar (id)
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Her saat için kayıt sayısını (kayitlar alt dizisi boyutundan) hesapla
    if (etkinlikler) {
      for (const etkinlik of etkinlikler) {
        if (etkinlik.etkinlik_saatleri) {
          for (const saat of etkinlik.etkinlik_saatleri) {
            saat.kayit_sayisi = saat.kayitlar ? saat.kayitlar.length : 0;
            // İstemciye (client) devasa UUID listesi gidip network yükü yapmasın diye ilgili alanı temizliyoruz
            delete saat.kayitlar;
          }
        }
      }
    }

    return NextResponse.json({ success: true, data: etkinlikler });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("GET /api/admin/etkinlikler HATA:", errMsg);
    return NextResponse.json(
      { success: false, message: "Etkinlikler yüklenirken hata oluştu.", error: errMsg },
      { status: 500 }
    );
  }
}

// Yeni etkinlik oluştur
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ad, aciklama } = body;

    if (!ad) {
      return NextResponse.json(
        { success: false, message: "Etkinlik adı gereklidir." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("etkinlikler")
      .insert({ ad, aciklama: aciklama || null })
      .select()
      .single();

    if (error) throw error;

    // Otomatik olarak sabit saat dilimlerini ekle
    const sabitSaatler = ["11.00 - 11.45", "12.00 - 12.45", "14.00 - 14.45", "15.00 - 15.45"];
    const saatlerEklenecek = sabitSaatler.map(saat => ({
      etkinlik_id: data.id,
      saat,
      kapasite: 15 // Varsayılan kapasite
    }));

    const { error: saatlerError } = await supabaseAdmin
      .from("etkinlik_saatleri")
      .insert(saatlerEklenecek);

    if (saatlerError) {
      console.error("Otomatik saatler eklenirken hata:", saatlerError);
      // Ana etkinlik eklendiği için genel bir hata fırlatmıyoruz, ancak logluyoruz.
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("POST /api/admin/etkinlikler HATA:", errMsg);
    return NextResponse.json(
      { success: false, message: "Etkinlik oluşturulurken hata oluştu.", error: errMsg },
      { status: 500 }
    );
  }
}
