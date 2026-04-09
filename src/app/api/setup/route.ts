import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * One-time setup endpoint - veritabanı tablolarını oluşturur.
 * Sadece bir kez çalıştırılmalıdır.
 */
export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    db: { schema: "public" },
  });

  const results: { step: string; status: string; error?: string }[] = [];

  try {
    // 1. Kademeler tablosu
    const { error: e1 } = await supabase.rpc("exec_sql", {
      sql_string: `CREATE TABLE IF NOT EXISTS kademeler (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        ad TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );`,
    });
    // exec_sql fonksiyonu yoksa, tabloları Supabase REST API ile oluşturamayız.
    // Bu durumda seed data eklemeye geçelim.

    if (e1) {
      // exec_sql mevcut değilse, tabloların zaten var olduğunu varsayalım
      // veya kullanıcıya bilgi verelim
      results.push({
        step: "exec_sql kontrolü",
        status: "failed",
        error: e1.message,
      });

      // Alternatif: Tabloların var olup olmadığını kontrol et
      const { error: checkErr } = await supabase
        .from("kademeler")
        .select("id")
        .limit(1);

      if (checkErr && checkErr.message.includes("does not exist")) {
        return NextResponse.json({
          success: false,
          message:
            "Tablolar henüz oluşturulmamış. Lütfen supabase-schema.sql dosyasını Supabase Dashboard > SQL Editor'da çalıştırın.",
          dashboardUrl: `https://supabase.com/dashboard/project/zsgxurcwfecmpnifuvqi/sql/new`,
        });
      }

      // Tablolar var ama boş olabilir - seed data ekle
      results.push({
        step: "Tablo kontrolü",
        status: "ok - tablolar mevcut",
      });
    }

    // Kademeler seed
    const { data: mevcutKademeler } = await supabase
      .from("kademeler")
      .select("id")
      .limit(1);

    if (!mevcutKademeler || mevcutKademeler.length === 0) {
      const kademeler = [
        { ad: "Anaokulu" },
        { ad: "1. Sınıf" },
        { ad: "2. Sınıf" },
        { ad: "3. Sınıf" },
        { ad: "4. Sınıf" },
      ];

      const { error: kErr } = await supabase
        .from("kademeler")
        .insert(kademeler);

      results.push({
        step: "Kademeler eklendi",
        status: kErr ? "failed" : "ok",
        error: kErr?.message,
      });

      // Sınıflar
      const { data: kademeData } = await supabase
        .from("kademeler")
        .select("id, ad");

      if (kademeData) {
        const siniflar: { kademe_id: string; sinif_no: string; sube: string }[] = [];
        for (const k of kademeData) {
          const sinifNo = k.ad === "Anaokulu" ? "Anaokulu" : k.ad.replace(". Sınıf", "");
          siniflar.push({ kademe_id: k.id, sinif_no: sinifNo, sube: "A" });
          siniflar.push({ kademe_id: k.id, sinif_no: sinifNo, sube: "B" });
        }

        const { error: sErr } = await supabase.from("siniflar").insert(siniflar);
        results.push({
          step: "Sınıflar eklendi",
          status: sErr ? "failed" : "ok",
          error: sErr?.message,
        });
      }
    } else {
      results.push({ step: "Kademeler", status: "zaten mevcut - atlandı" });
    }

    // Etkinlikler seed
    const { data: mevcutEtkinlikler } = await supabase
      .from("etkinlikler")
      .select("id")
      .limit(1);

    if (!mevcutEtkinlikler || mevcutEtkinlikler.length === 0) {
      const etkinlikler = [
        { ad: "Bilim Şenliği", aciklama: "Bilimsel deneylerin sergileneceği eğlenceli bir gün", aktif: true },
        { ad: "Spor Günü", aciklama: "Çeşitli spor aktiviteleri ve yarışmalar", aktif: true },
        { ad: "Sanat Atölyesi", aciklama: "Resim, müzik ve tiyatro çalıştayları", aktif: false },
      ];

      const { error: eErr } = await supabase
        .from("etkinlikler")
        .insert(etkinlikler);

      results.push({
        step: "Etkinlikler eklendi",
        status: eErr ? "failed" : "ok",
        error: eErr?.message,
      });

      // Etkinlik saatleri
      const { data: etkinlikData } = await supabase
        .from("etkinlikler")
        .select("id, ad");

      if (etkinlikData) {
        const saatler: { etkinlik_id: string; saat: string; kapasite: number }[] = [];

        const bilim = etkinlikData.find((e) => e.ad === "Bilim Şenliği");
        const spor = etkinlikData.find((e) => e.ad === "Spor Günü");
        const sanat = etkinlikData.find((e) => e.ad === "Sanat Atölyesi");

        if (bilim) {
          saatler.push({ etkinlik_id: bilim.id, saat: "09:00 - 10:00", kapasite: 30 });
          saatler.push({ etkinlik_id: bilim.id, saat: "10:30 - 11:30", kapasite: 30 });
          saatler.push({ etkinlik_id: bilim.id, saat: "13:00 - 14:00", kapasite: 25 });
        }
        if (spor) {
          saatler.push({ etkinlik_id: spor.id, saat: "09:00 - 10:30", kapasite: 40 });
          saatler.push({ etkinlik_id: spor.id, saat: "11:00 - 12:30", kapasite: 40 });
        }
        if (sanat) {
          saatler.push({ etkinlik_id: sanat.id, saat: "14:00 - 15:30", kapasite: 20 });
          saatler.push({ etkinlik_id: sanat.id, saat: "16:00 - 17:30", kapasite: 20 });
        }

        const { error: esErr } = await supabase
          .from("etkinlik_saatleri")
          .insert(saatler);

        results.push({
          step: "Etkinlik saatleri eklendi",
          status: esErr ? "failed" : "ok",
          error: esErr?.message,
        });
      }
    } else {
      results.push({ step: "Etkinlikler", status: "zaten mevcut - atlandı" });
    }

    return NextResponse.json({ success: true, results });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : JSON.stringify(err);
    return NextResponse.json(
      { success: false, message: "Setup sırasında hata oluştu.", error: errMsg, results },
      { status: 500 }
    );
  }
}
