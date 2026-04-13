"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface EtkinlikSaati {
  id: string;
  saat: string;
  kapasite: number;
  kayit_sayisi: number;
}

interface Etkinlik {
  id: string;
  ad: string;
  aciklama: string | null;
  etkinlik_saatleri: EtkinlikSaati[];
}

interface Sinif {
  id: string;
  sinif_no: string;
  sube: string;
}

interface Kademe {
  id: string;
  ad: string;
  siniflar: Sinif[];
}

type Step = 1 | 2 | 3;

export default function KayitPage() {
  const [step, setStep] = useState<Step>(1);
  const [etkinlikler, setEtkinlikler] = useState<Etkinlik[]>([]);
  const [kademeler, setKademeler] = useState<Kademe[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form state
  const [selectedSaat, setSelectedSaat] = useState<string>("");
  const [selectedEtkinlik, setSelectedEtkinlik] = useState<string>("");
  const [selectedKademe, setSelectedKademe] = useState<string>("");
  const [veliAdSoyad, setVeliAdSoyad] = useState("");
  const [veliTelefon, setVeliTelefon] = useState("");
  const [ogrenciAdSoyad, setOgrenciAdSoyad] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eRes, kRes] = await Promise.all([
          fetch("/api/admin/etkinlikler"),
          fetch("/api/admin/kademeler"),
        ]);
        const eData = await eRes.json();
        const kData = await kRes.json();

        // Sadece aktif etkinlikleri göster
        const aktifEtkinlikler = (eData.data || []).filter(
          (e: Etkinlik & { aktif: boolean }) => e.aktif
        );
        setEtkinlikler(aktifEtkinlikler);
        setKademeler(kData.data || []);
      } catch {
        console.error("Veriler yüklenemedi");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const selectedEtkinlikObj = etkinlikler.find(
    (e) => e.id === selectedEtkinlik
  );
  const selectedKademeObj = kademeler.find((k) => k.id === selectedKademe);
  const selectedSaatObj = selectedEtkinlikObj?.etkinlik_saatleri.find(
    (s) => s.id === selectedSaat
  );

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/kayit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          veli_ad_soyad: veliAdSoyad,
          veli_telefon: veliTelefon,
          ogrenci_ad_soyad: ogrenciAdSoyad,
          kademe_id: selectedKademe,
          etkinlik_saati_id: selectedSaat,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || "Kayıt oluşturulamadı.");
      }
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  // Başarılı kayıt ekranı
  if (success) {
    return (
      <div className="flex flex-1 flex-col">
        <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex h-16 max-w-3xl items-center px-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-gray-900">Kaplan Okulları</span>
            </Link>
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center px-4">
          <Card className="w-full max-w-md border-0 shadow-xl text-center">
            <CardContent className="py-12">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Kayıt Başarılı!
              </h2>
              <p className="mt-3 text-gray-500">
                Kaydınız başarıyla alınmıştır. Etkinlik gününde görüşmek üzere!
              </p>
              <div className="mt-8">
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Ana Sayfaya Dön
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-gray-900">Kaplan Okulları</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center bg-gradient-to-b from-blue-50/30 to-white px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Progress Steps */}
          <div className="mb-8 flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 ${
                    step >= s
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step > s ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s
                  )}
                </div>
                {s < 3 && (
                  <div
                    className={`h-0.5 w-12 transition-colors duration-300 ${
                      step > s ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {loading ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="space-y-4 py-8">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Step 1: Etkinlik Seçimi */}
              {step === 1 && (
                <Card className="border-0 shadow-lg animate-in fade-in slide-in-from-right-2">
                  <CardHeader>
                    <CardTitle>Etkinlik Seçimi</CardTitle>
                    <CardDescription>
                      Katılmak istediğiniz etkinliği ve saat dilimini seçin
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {etkinlikler.length === 0 ? (
                      <Alert>
                        <AlertDescription>
                          Şu anda kayıt alınan etkinlik bulunmamaktadır.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-6">
                        <Alert className="bg-blue-50 border-blue-200">
                          <AlertDescription className="text-blue-800 text-sm">
                            <span className="font-medium">Bilgi:</span> Bir öğrenci en fazla <strong>2 farklı etkinliğe</strong> kayıt olabilir. Farklı bir etkinliğe daha kayıt olmak için bu işlemi tamamladıktan sonra tekrar kayıt oluşturabilirsiniz.
                          </AlertDescription>
                        </Alert>
                        <div className="space-y-2">
                          <Label>Etkinlik Seçin</Label>
                          <Select
                            value={selectedEtkinlik || ""}
                            onValueChange={(v) => {
                              setSelectedEtkinlik(v || "");
                              setSelectedSaat("");
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Katılmak istediğiniz etkinliği seçiniz">
                                {selectedEtkinlik ? etkinlikler.find(e => e.id === selectedEtkinlik)?.ad : undefined}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {etkinlikler.map((etkinlik) => (
                                <SelectItem key={etkinlik.id} value={etkinlik.id}>
                                  {etkinlik.ad}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedEtkinlik && (
                          <div className="space-y-3">
                            <Label>Saat Dilimi Seçin</Label>
                            <div className="space-y-2">
                              {etkinlikler
                                .find((e) => e.id === selectedEtkinlik)
                                ?.etkinlik_saatleri?.map((saat) => {
                                  const dolu = saat.kayit_sayisi >= saat.kapasite;
                                  return (
                                    <button
                                      key={saat.id}
                                      type="button"
                                      disabled={dolu}
                                      className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm transition-all ${
                                        selectedSaat === saat.id
                                          ? "border-blue-500 bg-blue-100/50 text-blue-700"
                                          : dolu
                                          ? "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                                          : "border-gray-100 hover:border-blue-200 hover:bg-blue-50/30"
                                      }`}
                                      onClick={() => setSelectedSaat(saat.id)}
                                    >
                                      <span className="font-medium">{saat.saat}</span>
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          variant={dolu ? "destructive" : "secondary"}
                                          className="text-xs"
                                        >
                                          {dolu
                                            ? "Dolu"
                                            : `${saat.kapasite - saat.kayit_sayisi} yer kaldı`}
                                        </Badge>
                                      </div>
                                    </button>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <Button
                        onClick={() => setStep(2)}
                        disabled={!selectedSaat}
                        className="bg-gradient-to-r from-blue-600 to-blue-700"
                      >
                        Devam Et
                        <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Bilgi Formu */}
              {step === 2 && (
                <Card className="border-0 shadow-lg animate-in fade-in slide-in-from-right-2">
                  <CardHeader>
                    <CardTitle>Kayıt Bilgileri</CardTitle>
                    <CardDescription>
                      Veli ve öğrenci bilgilerini doldurun
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="veli-ad">Veli Adı Soyadı</Label>
                      <Input
                        id="veli-ad"
                        placeholder="Ad Soyad"
                        value={veliAdSoyad}
                        onChange={(e) => setVeliAdSoyad(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="veli-telefon">Veli Telefon</Label>
                      <Input
                        id="veli-telefon"
                        placeholder="05XX XXX XX XX"
                        value={veliTelefon}
                        onChange={(e) => setVeliTelefon(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ogrenci-ad">Öğrenci Adı Soyadı</Label>
                      <Input
                        id="ogrenci-ad"
                        placeholder="Ad Soyad"
                        value={ogrenciAdSoyad}
                        onChange={(e) => setOgrenciAdSoyad(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Kademe</Label>
                      <Select
                        value={selectedKademe}
                        onValueChange={(v) => {
                          setSelectedKademe(v ?? "");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kademe seçin">
                            {selectedKademe ? kademeler.find(k => k.id === selectedKademe)?.ad : undefined}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {kademeler.map((k) => (
                            <SelectItem key={k.id} value={k.id}>
                              {k.ad}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={() => setStep(1)}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Geri
                      </Button>
                      <Button
                        onClick={() => setStep(3)}
                        disabled={
                          !veliAdSoyad ||
                          !veliTelefon ||
                          !ogrenciAdSoyad ||
                          !selectedKademe
                        }
                        className="bg-gradient-to-r from-blue-600 to-blue-700"
                      >
                        Devam Et
                        <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Onay */}
              {step === 3 && (
                <Card className="border-0 shadow-lg animate-in fade-in slide-in-from-right-2">
                  <CardHeader>
                    <CardTitle>Kayıt Onayı</CardTitle>
                    <CardDescription>
                      Bilgilerinizi kontrol edin ve onaylayın
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="rounded-xl bg-gray-50 p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Etkinlik</span>
                        <span className="font-medium text-gray-900">
                          {selectedEtkinlikObj?.ad}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Saat</span>
                        <span className="font-medium text-gray-900">
                          {selectedSaatObj?.saat}
                        </span>
                      </div>
                      <div className="h-px bg-gray-200" />
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Veli</span>
                        <span className="font-medium text-gray-900">
                          {veliAdSoyad}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Telefon</span>
                        <span className="font-medium text-gray-900">
                          {veliTelefon}
                        </span>
                      </div>
                      <div className="h-px bg-gray-200" />
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Öğrenci</span>
                        <span className="font-medium text-gray-900">
                          {ogrenciAdSoyad}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Kademe</span>
                        <span className="font-medium text-gray-900">
                          {selectedKademeObj?.ad}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={() => setStep(2)}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Geri
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                      >
                        {submitting ? (
                          <span className="flex items-center gap-2">
                            <svg
                              className="h-4 w-4 animate-spin"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Kaydediliyor...
                          </span>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Kaydı Onayla
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
