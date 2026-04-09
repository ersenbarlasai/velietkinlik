"use client";

import { useEffect, useState, useCallback } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface KayitDetay {
  id: string;
  veli_ad_soyad: string;
  veli_telefon: string;
  ogrenci_ad_soyad: string;
  created_at: string;
  kademeler?: { ad: string };
  siniflar?: {
    sinif_no: string;
    sube: string;
    kademeler?: { ad: string };
  };
  etkinlik_saatleri?: {
    saat: string;
    etkinlikler?: { ad: string };
  };
}

interface Etkinlik {
  id: string;
  ad: string;
}

interface Kademe {
  id: string;
  ad: string;
}

export default function RaporlarPage() {
  const [kayitlar, setKayitlar] = useState<KayitDetay[]>([]);
  const [etkinlikler, setEtkinlikler] = useState<Etkinlik[]>([]);
  const [kademeler, setKademeler] = useState<Kademe[]>([]);
  const [loading, setLoading] = useState(true);
  const [etkinlikFilter, setEtkinlikFilter] = useState<string>("all");
  const [kademeFilter, setKademeFilter] = useState<string>("all");
  const [saatFilter, setSaatFilter] = useState<string>("all");

  const fetchRaporlar = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (etkinlikFilter && etkinlikFilter !== "all") {
        params.set("etkinlik_id", etkinlikFilter);
      }
      if (kademeFilter && kademeFilter !== "all") {
        params.set("kademe_id", kademeFilter);
      }
      if (saatFilter && saatFilter !== "all") {
        params.set("saat", saatFilter);
      }

      const res = await fetch(`/api/admin/raporlar?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setKayitlar(data.data || []);
      }
    } catch {
      console.error("Raporlar yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, [etkinlikFilter, kademeFilter, saatFilter]);

  useEffect(() => {
    const fetchFilters = async () => {
      const [eRes, kRes] = await Promise.all([
        fetch("/api/admin/etkinlikler"),
        fetch("/api/admin/kademeler"),
      ]);
      const eData = await eRes.json();
      const kData = await kRes.json();
      setEtkinlikler(eData.data || []);
      setKademeler(kData.data || []);
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchRaporlar();
  }, [fetchRaporlar]);

  const handleDeleteKayit = async (id: string) => {
    if (!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/admin/kayitlar/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchRaporlar();
      } else {
        alert(data.message || "Silme başarısız.");
      }
    } catch {
      alert("Kayıt silinirken bir hata oluştu.");
    }
  };

  const handleExportExcel = () => {
    if (kayitlar.length === 0) return;

    const headers = [
      "Veli Ad Soyad",
      "Veli Telefon",
      "Öğrenci Ad Soyad",
      "Kademe",
      "Sınıf",
      "Etkinlik",
      "Saat",
      "Kayıt Tarihi",
    ];

    const rows = kayitlar.map((k) => [
      k.veli_ad_soyad,
      k.veli_telefon,
      k.ogrenci_ad_soyad,
      k.kademeler?.ad || k.siniflar?.kademeler?.ad || "",
      k.siniflar ? `${k.siniflar.sinif_no}-${k.siniflar.sube}` : "-",
      k.etkinlik_saatleri?.etkinlikler?.ad || "",
      k.etkinlik_saatleri?.saat || "",
      new Date(k.created_at).toLocaleString("tr-TR"),
    ]);

    // XLSX formatına dönüştürme
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Kayitlar");
    
    // Sütun genişliklerini ayarla
    worksheet["!cols"] = [
      { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 15 },
      { wch: 10 }, { wch: 25 }, { wch: 15 }, { wch: 20 }
    ];

    XLSX.writeFile(workbook, `kayitlar_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Raporlar</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kayıtları görüntüleyin ve dışa aktarın
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExportExcel}
          disabled={kayitlar.length === 0}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Excel İndir (.xlsx)
        </Button>
      </div>

      {/* Filtreler */}
      <Card className="mb-6 border-0 shadow-sm">
        <CardContent className="flex flex-col gap-4 py-4 sm:flex-row">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Etkinlik
            </label>
            <Select value={etkinlikFilter} onValueChange={(v) => setEtkinlikFilter(v ?? "all")}>
              <SelectTrigger>
                <SelectValue placeholder="Tüm etkinlikler" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Etkinlikler</SelectItem>
                {etkinlikler.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.ad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Kademe
            </label>
            <Select value={kademeFilter} onValueChange={(v) => setKademeFilter(v ?? "all")}>
              <SelectTrigger>
                <SelectValue placeholder="Tüm kademeler" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kademeler</SelectItem>
                {kademeler.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.ad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Etkinlik Saati
            </label>
            <Select value={saatFilter} onValueChange={(v) => setSaatFilter(v ?? "all")}>
              <SelectTrigger>
                <SelectValue placeholder="Tüm saatler" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Saatler</SelectItem>
                <SelectItem value="11.00 - 11.45">11.00 - 11.45</SelectItem>
                <SelectItem value="12.00 - 12.45">12.00 - 12.45</SelectItem>
                <SelectItem value="14.00 - 14.45">14.00 - 14.45</SelectItem>
                <SelectItem value="15.00 - 15.45">15.00 - 15.45</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tablo */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : kayitlar.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mb-4 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium text-gray-600">
              Kayıt bulunamadı
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Seçili filtrelere uygun kayıt yok.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80">
                  <TableHead className="font-semibold">Veli</TableHead>
                  <TableHead className="font-semibold">Telefon</TableHead>
                  <TableHead className="font-semibold">Öğrenci</TableHead>
                  <TableHead className="font-semibold">Kademe</TableHead>
                  <TableHead className="font-semibold">Etkinlik</TableHead>
                  <TableHead className="font-semibold">Saat</TableHead>
                  <TableHead className="font-semibold">Tarih</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kayitlar.map((kayit) => (
                  <TableRow key={kayit.id}>
                    <TableCell className="font-medium">
                      {kayit.veli_ad_soyad}
                    </TableCell>
                    <TableCell>{kayit.veli_telefon}</TableCell>
                    <TableCell>{kayit.ogrenci_ad_soyad}</TableCell>
                    <TableCell>
                      {kayit.kademeler?.ad || kayit.siniflar?.kademeler?.ad || ""}
                      {kayit.siniflar ? <span className="ml-1 text-gray-400">({kayit.siniflar.sinif_no}-{kayit.siniflar.sube})</span> : null}
                    </TableCell>
                    <TableCell>
                      {kayit.etkinlik_saatleri?.etkinlikler?.ad}
                    </TableCell>
                    <TableCell>{kayit.etkinlik_saatleri?.saat}</TableCell>
                    <TableCell className="text-gray-500">
                      {new Date(kayit.created_at).toLocaleDateString("tr-TR")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                        title="Kaydı Sil"
                        onClick={() => handleDeleteKayit(kayit.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="border-t border-gray-100 px-4 py-3">
            <p className="text-sm text-gray-500">
              Toplam <strong>{kayitlar.length}</strong> kayıt
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
