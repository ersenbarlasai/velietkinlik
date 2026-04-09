-- =============================================
-- Kaplan Okulları — Etkinlik Kayıt Sistemi
-- Veritabanı Şeması
-- =============================================

-- UUID extension (genellikle varsayılan olarak aktif)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────
-- 1. KADEMELER
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS kademeler (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ad TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────
-- 2. SINIFLAR
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS siniflar (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  kademe_id UUID NOT NULL REFERENCES kademeler(id) ON DELETE CASCADE,
  sinif_no TEXT NOT NULL,
  sube TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────
-- 3. ETKİNLİKLER
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS etkinlikler (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ad TEXT NOT NULL,
  aciklama TEXT,
  aktif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────
-- 4. ETKİNLİK SAATLERİ
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS etkinlik_saatleri (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  etkinlik_id UUID NOT NULL REFERENCES etkinlikler(id) ON DELETE CASCADE,
  saat TEXT NOT NULL,
  kapasite INTEGER NOT NULL CHECK (kapasite > 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────
-- 5. KAYITLAR
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS kayitlar (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  veli_ad_soyad TEXT NOT NULL,
  veli_telefon TEXT NOT NULL,
  ogrenci_ad_soyad TEXT NOT NULL,
  kademe_id UUID NOT NULL REFERENCES kademeler(id) ON DELETE CASCADE,
  sinif_id UUID REFERENCES siniflar(id) ON DELETE CASCADE, -- Artık zorunlu değil
  etkinlik_saati_id UUID NOT NULL REFERENCES etkinlik_saatleri(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────
-- RLS (Row Level Security) Politikaları
-- ─────────────────────────────────────

-- Kademeler: Herkes okuyabilir
ALTER TABLE kademeler ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kademeler_select_policy" ON kademeler FOR SELECT USING (true);
CREATE POLICY "kademeler_all_service" ON kademeler FOR ALL USING (true) WITH CHECK (true);

-- Sınıflar: Herkes okuyabilir
ALTER TABLE siniflar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "siniflar_select_policy" ON siniflar FOR SELECT USING (true);
CREATE POLICY "siniflar_all_service" ON siniflar FOR ALL USING (true) WITH CHECK (true);

-- Etkinlikler: Herkes okuyabilir
ALTER TABLE etkinlikler ENABLE ROW LEVEL SECURITY;
CREATE POLICY "etkinlikler_select_policy" ON etkinlikler FOR SELECT USING (true);
CREATE POLICY "etkinlikler_all_service" ON etkinlikler FOR ALL USING (true) WITH CHECK (true);

-- Etkinlik Saatleri: Herkes okuyabilir
ALTER TABLE etkinlik_saatleri ENABLE ROW LEVEL SECURITY;
CREATE POLICY "etkinlik_saatleri_select_policy" ON etkinlik_saatleri FOR SELECT USING (true);
CREATE POLICY "etkinlik_saatleri_all_service" ON etkinlik_saatleri FOR ALL USING (true) WITH CHECK (true);

-- Kayıtlar: INSERT herkes yapabilir, SELECT herkes yapabilir
ALTER TABLE kayitlar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kayitlar_insert_policy" ON kayitlar FOR INSERT WITH CHECK (true);
CREATE POLICY "kayitlar_select_policy" ON kayitlar FOR SELECT USING (true);
CREATE POLICY "kayitlar_all_service" ON kayitlar FOR ALL USING (true) WITH CHECK (true);

-- ─────────────────────────────────────
-- SEED DATA (Örnek Veriler)
-- ─────────────────────────────────────

-- Kademeler
INSERT INTO kademeler (ad) VALUES 
  ('Anaokulu'),
  ('1. Sınıf'),
  ('2. Sınıf'),
  ('3. Sınıf'),
  ('4. Sınıf');

-- Sınıflar (her kademe için A ve B şubesi)
INSERT INTO siniflar (kademe_id, sinif_no, sube)
SELECT id, 'Anaokulu', 'A' FROM kademeler WHERE ad = 'Anaokulu'
UNION ALL
SELECT id, 'Anaokulu', 'B' FROM kademeler WHERE ad = 'Anaokulu'
UNION ALL
SELECT id, '1', 'A' FROM kademeler WHERE ad = '1. Sınıf'
UNION ALL
SELECT id, '1', 'B' FROM kademeler WHERE ad = '1. Sınıf'
UNION ALL
SELECT id, '2', 'A' FROM kademeler WHERE ad = '2. Sınıf'
UNION ALL
SELECT id, '2', 'B' FROM kademeler WHERE ad = '2. Sınıf'
UNION ALL
SELECT id, '3', 'A' FROM kademeler WHERE ad = '3. Sınıf'
UNION ALL
SELECT id, '3', 'B' FROM kademeler WHERE ad = '3. Sınıf'
UNION ALL
SELECT id, '4', 'A' FROM kademeler WHERE ad = '4. Sınıf'
UNION ALL
SELECT id, '4', 'B' FROM kademeler WHERE ad = '4. Sınıf';

-- Etkinlikler
INSERT INTO etkinlikler (ad, aciklama, aktif) VALUES 
  ('Bilim Şenliği', 'Bilimsel deneylerin sergileneceği eğlenceli bir gün', true),
  ('Spor Günü', 'Çeşitli spor aktiviteleri ve yarışmalar', true),
  ('Sanat Atölyesi', 'Resim, müzik ve tiyatro çalıştayları', false);

-- Etkinlik Saatleri
INSERT INTO etkinlik_saatleri (etkinlik_id, saat, kapasite)
SELECT id, '09:00 - 10:00', 30 FROM etkinlikler WHERE ad = 'Bilim Şenliği'
UNION ALL
SELECT id, '10:30 - 11:30', 30 FROM etkinlikler WHERE ad = 'Bilim Şenliği'
UNION ALL
SELECT id, '13:00 - 14:00', 25 FROM etkinlikler WHERE ad = 'Bilim Şenliği'
UNION ALL
SELECT id, '09:00 - 10:30', 40 FROM etkinlikler WHERE ad = 'Spor Günü'
UNION ALL
SELECT id, '11:00 - 12:30', 40 FROM etkinlikler WHERE ad = 'Spor Günü'
UNION ALL
SELECT id, '14:00 - 15:30', 20 FROM etkinlikler WHERE ad = 'Sanat Atölyesi'
UNION ALL
SELECT id, '16:00 - 17:30', 20 FROM etkinlikler WHERE ad = 'Sanat Atölyesi';
