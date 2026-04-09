// Supabase'e SQL şemasını uygulama scripti
// supabase-js kullanarak rpc çağrısı yapmak yerine,
// her table oluşturmayı ayrı ayrı yapıyoruz.

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const SUPABASE_URL = "https://zsgxurcwfecmpnifuvqi.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzZ3h1cmN3ZmVjbXBuaWZ1dnFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTY3MDM1NywiZXhwIjoyMDkxMjQ2MzU3fQ.9rUr0qdhjhLG1ozqGvDrBShWiyTE-NF8uu_HI9_HxJM";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function runSchema() {
  console.log("Supabase veritabanı şeması uygulanıyor...\n");

  // SQL dosyasını oku ve statement'lara böl
  const sqlPath = path.join(__dirname, "supabase-schema.sql");
  const sql = fs.readFileSync(sqlPath, "utf-8");

  // Supabase Management API ile SQL çalıştır
  // Project ref: zsgxurcwfecmpnifuvqi
  const projectRef = "zsgxurcwfecmpnifuvqi";
  
  const res = await fetch(
    `https://${projectRef}.supabase.co/rest/v1/rpc/exec_sql`,
    {
      method: "POST",
      headers: {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql_string: sql }),
    }
  );

  if (res.ok) {
    console.log("✅ SQL başarıyla çalıştırıldı!");
    const result = await res.json();
    console.log("Sonuç:", result);
  } else {
    const errorText = await res.text();
    console.log("❌ Hata (status:", res.status, ")");
    console.log("Detay:", errorText);
    console.log("\n--- Alternatif yöntem deneniyor ---\n");
    
    // Alternatif: Tabloları Supabase Dashboard SQL Editor'da manuel oluşturun
    console.log("Lütfen SQL'i Supabase Dashboard > SQL Editor'da çalıştırın:");
    console.log("1. https://supabase.com/dashboard/project/" + projectRef + "/sql/new");
    console.log("2. supabase-schema.sql dosyasının içeriğini yapıştırın");
    console.log("3. Run butonuna tıklayın");
  }
}

runSchema().catch(console.error);
