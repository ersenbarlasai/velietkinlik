import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

/**
 * Veli kayıt oluşturma API'si (Public)
 * Race condition koruması için Supabase RPC kullanılabilir.
 * Şimdilik basit kapasite kontrolü yapılıyor.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { veli_ad_soyad, veli_telefon, ogrenci_ad_soyad, kademe_id, etkinlik_saati_id } = body;

    // Validasyon
    if (!veli_ad_soyad || !veli_telefon || !ogrenci_ad_soyad || !kademe_id || !etkinlik_saati_id) {
      return NextResponse.json(
        { success: false, message: "Tüm alanların doldurulması zorunludur." },
        { status: 400 }
      );
    }

    // Etkinlik saati bilgilerini al
    const { data: saat, error: saatError } = await supabaseAdmin
      .from("etkinlik_saatleri")
      .select("*, etkinlikler!inner(aktif)")
      .eq("id", etkinlik_saati_id)
      .single();

    if (saatError || !saat) {
      return NextResponse.json(
        { success: false, message: "Geçersiz etkinlik saati." },
        { status: 400 }
      );
    }

    // Etkinlik aktif mi kontrol et
    if (!saat.etkinlikler?.aktif) {
      return NextResponse.json(
        { success: false, message: "Bu etkinlik şu anda kayıt almamaktadır." },
        { status: 400 }
      );
    }

    // Mevcut kayıt sayısını kontrol et
    const { count } = await supabaseAdmin
      .from("kayitlar")
      .select("*", { count: "exact", head: true })
      .eq("etkinlik_saati_id", etkinlik_saati_id);

    if (count !== null && count >= saat.kapasite) {
      return NextResponse.json(
        { success: false, message: "Bu saat dilimi için katılım sınırına ulaşıldı." },
        { status: 409 }
      );
    }

    // Aynı öğrenci + aynı etkinlik saati mükerrer kontrolü
    const { data: mevcutKayit } = await supabaseAdmin
      .from("kayitlar")
      .select("id")
      .eq("ogrenci_ad_soyad", ogrenci_ad_soyad)
      .eq("veli_telefon", veli_telefon)
      .eq("etkinlik_saati_id", etkinlik_saati_id)
      .maybeSingle();

    if (mevcutKayit) {
      return NextResponse.json(
        { success: false, message: "Bu öğrenci zaten bu etkinlik saatine kayıtlı." },
        { status: 409 }
      );
    }

    // Bir öğrencinin (veya velinin) en fazla 2 atölye (etkinlik) seçebileceği kontrolü
    const { count: ogrenciKayitSayisi } = await supabaseAdmin
      .from("kayitlar")
      .select("*", { count: "exact", head: true })
      .eq("ogrenci_ad_soyad", ogrenci_ad_soyad)
      .eq("veli_telefon", veli_telefon);

    if (ogrenciKayitSayisi !== null && ogrenciKayitSayisi >= 2) {
      return NextResponse.json(
        { success: false, message: "Bir öğrenci için en fazla 2 farklı atölyeye (etkinliğe) kayıt olabilirsiniz." },
        { status: 403 }
      );
    }


    const { data, error } = await supabaseAdmin
      .from("kayitlar")
      .insert({
        veli_ad_soyad,
        veli_telefon,
        ogrenci_ad_soyad,
        kademe_id,
        etkinlik_saati_id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { success: true, message: "Kaydınız başarıyla alındı.", data },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Kayıt oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}
