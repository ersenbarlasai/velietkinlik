// ──────────────────────────────────────────────
// Veritabanı Tablo Tipleri
// ──────────────────────────────────────────────

/** Kademe (örn: Anaokulu, 1. Sınıf, 2. Sınıf ...) */
export interface Kademe {
  id: string;
  ad: string;
  created_at: string;
}

/** Sınıf (örn: 1-A, 1-B ...) */
export interface Sinif {
  id: string;
  kademe_id: string;
  sinif_no: string;
  sube: string;
  created_at: string;
}

/** Sınıf + kademe adı (join sonucu) */
export interface SinifWithKademe extends Sinif {
  kademe?: Kademe;
}

/** Etkinlik (örn: Bilim Şenliği, Spor Günü ...) */
export interface Etkinlik {
  id: string;
  ad: string;
  aciklama: string | null;
  aktif: boolean;
  created_at: string;
}

/** Etkinlik saati (her etkinliğin birden fazla saati olabilir) */
export interface EtkinlikSaati {
  id: string;
  etkinlik_id: string;
  saat: string;
  kapasite: number;
  created_at: string;
}

/** Etkinlik saati + mevcut kayıt sayısı */
export interface EtkinlikSaatiWithCount extends EtkinlikSaati {
  kayit_sayisi: number;
}

/** Etkinlik + saatleri (join sonucu) */
export interface EtkinlikWithSaatler extends Etkinlik {
  etkinlik_saatleri: EtkinlikSaatiWithCount[];
}

/** Veli kayıt bilgisi */
export interface Kayit {
  id: string;
  veli_ad_soyad: string;
  veli_telefon: string;
  ogrenci_ad_soyad: string;
  sinif_id: string;
  etkinlik_saati_id: string;
  created_at: string;
}

/** Kayıt + ilişkili bilgiler (raporlama için) */
export interface KayitDetay extends Kayit {
  sinif?: SinifWithKademe;
  etkinlik_saati?: EtkinlikSaati & {
    etkinlik?: Etkinlik;
  };
}

// ──────────────────────────────────────────────
// API Response Tipleri
// ──────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ApiError {
  success: false;
  message: string;
}

// ──────────────────────────────────────────────
// Form Tipleri
// ──────────────────────────────────────────────

export interface KayitFormData {
  veli_ad_soyad: string;
  veli_telefon: string;
  ogrenci_ad_soyad: string;
  sinif_id: string;
  etkinlik_saati_id: string;
}

export interface EtkinlikFormData {
  ad: string;
  aciklama?: string;
  aktif?: boolean;
}

export interface EtkinlikSaatiFormData {
  saat: string;
  kapasite: number;
}

export interface KademeFormData {
  ad: string;
}

export interface SinifFormData {
  kademe_id: string;
  sinif_no: string;
  sube: string;
}
