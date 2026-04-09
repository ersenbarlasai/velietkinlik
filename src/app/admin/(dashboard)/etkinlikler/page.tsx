"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  aktif: boolean;
  created_at: string;
  etkinlik_saatleri: EtkinlikSaati[];
}

export default function EtkinliklerPage() {
  const [etkinlikler, setEtkinlikler] = useState<Etkinlik[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saatDialogOpen, setSaatDialogOpen] = useState(false);
  const [selectedEtkinlik, setSelectedEtkinlik] = useState<string | null>(null);
  const [formData, setFormData] = useState({ ad: "", aciklama: "" });
  const [saatFormData, setSaatFormData] = useState({ saat: "", kapasite: "15" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchEtkinlikler = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/etkinlikler");
      const data = await res.json();
      if (data.success) {
        setEtkinlikler(data.data || []);
      }
    } catch {
      console.error("Etkinlikler yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEtkinlikler();
  }, [fetchEtkinlikler]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/etkinlikler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setDialogOpen(false);
        setFormData({ ad: "", aciklama: "" });
        fetchEtkinlikler();
      } else {
        setError(data.message);
      }
    } catch {
      setError("Bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAktif = async (id: string, aktif: boolean) => {
    try {
      await fetch(`/api/admin/etkinlikler/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aktif: !aktif }),
      });
      fetchEtkinlikler();
    } catch {
      console.error("Güncelleme başarısız");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu etkinliği silmek istediğinize emin misiniz?")) return;
    try {
      await fetch(`/api/admin/etkinlikler/${id}`, { method: "DELETE" });
      fetchEtkinlikler();
    } catch {
      console.error("Silme başarısız");
    }
  };

  const handleAddSaat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEtkinlik) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/etkinlikler/${selectedEtkinlik}/saatler`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            saat: saatFormData.saat,
            kapasite: Number(saatFormData.kapasite),
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setSaatDialogOpen(false);
        setSaatFormData({ saat: "", kapasite: "15" });
        setSelectedEtkinlik(null);
        fetchEtkinlikler();
      } else {
        setError(data.message);
      }
    } catch {
      setError("Bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSaat = async (etkinlikId: string, saatId: string) => {
    if (!confirm("Bu saati silmek istediğinize emin misiniz?")) return;
    try {
      await fetch(
        `/api/admin/etkinlikler/${etkinlikId}/saatler/${saatId}`,
        { method: "DELETE" }
      );
      fetchEtkinlikler();
    } catch {
      console.error("Saat silme başarısız");
    }
  };

  const handleEditCapacity = async (etkinlikId: string, saatId: string, currentKapasite: number) => {
    const newVal = window.prompt(`Yeni kapasiteyi girin (Mevcut: ${currentKapasite}):`, currentKapasite.toString());
    if (newVal === null) return;
    const kapasite = parseInt(newVal, 10);
    if (isNaN(kapasite) || kapasite < 1) {
      alert("Geçerli bir sayı giriniz.");
      return;
    }
    try {
      await fetch(
        `/api/admin/etkinlikler/${etkinlikId}/saatler/${saatId}`,
        { 
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kapasite })
        }
      );
      fetchEtkinlikler();
    } catch {
      console.error("Kapasite güncelleme başarısız");
    }
  };

  if (loading) {
    return (
      <div>
        <div className="mb-8 flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Etkinlikler</h1>
          <p className="mt-1 text-sm text-gray-500">
            Etkinlikleri yönetin ve saat dilimleri ekleyin
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={<Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" />}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Yeni Etkinlik
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Etkinlik Oluştur</DialogTitle>
              <DialogDescription>
                Etkinlik bilgilerini doldurup kaydedin.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="etkinlik-ad">Etkinlik Adı</Label>
                <Input
                  id="etkinlik-ad"
                  placeholder="Bilim Şenliği"
                  value={formData.ad}
                  onChange={(e) =>
                    setFormData({ ...formData, ad: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="etkinlik-aciklama">Açıklama</Label>
                <Textarea
                  id="etkinlik-aciklama"
                  placeholder="Etkinlik hakkında kısa açıklama..."
                  value={formData.aciklama}
                  onChange={(e) =>
                    setFormData({ ...formData, aciklama: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  İptal
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Saat Ekleme Dialog */}
      <Dialog open={saatDialogOpen} onOpenChange={setSaatDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Saat Dilimi Ekle</DialogTitle>
            <DialogDescription>
              Etkinliğe yeni bir saat dilimi ekleyin.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSaat} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="saat">Saat</Label>
              </div>
              <div className="flex flex-wrap gap-2 pb-1">
                {["11.00 - 11.45", "12.00 - 12.45", "14.00 - 14.45", "15.00 - 15.45"].map((h) => (
                  <Badge
                    key={h}
                    variant="secondary"
                    className="cursor-pointer hover:bg-gray-200"
                    onClick={() => setSaatFormData({ ...saatFormData, saat: h })}
                  >
                    {h}
                  </Badge>
                ))}
              </div>
              <Input
                id="saat"
                placeholder="Örn: 09:00 - 10:00"
                value={saatFormData.saat}
                onChange={(e) =>
                  setSaatFormData({ ...saatFormData, saat: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kapasite">Kapasite</Label>
              <Input
                id="kapasite"
                type="number"
                min="1"
                placeholder="15"
                value={saatFormData.kapasite}
                onChange={(e) =>
                  setSaatFormData({ ...saatFormData, kapasite: e.target.value })
                }
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSaatDialogOpen(false)}
              >
                İptal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Ekleniyor..." : "Ekle"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Etkinlik Listesi */}
      {etkinlikler.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mb-4 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium text-gray-600">
              Henüz etkinlik oluşturulmamış
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Yukarıdaki &quot;Yeni Etkinlik&quot; butonunu kullanarak başlayın.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {etkinlikler.map((etkinlik) => (
            <Card key={etkinlik.id} className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{etkinlik.ad}</CardTitle>
                    <Badge
                      variant={etkinlik.aktif ? "default" : "secondary"}
                      className={
                        etkinlik.aktif
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                          : ""
                      }
                    >
                      {etkinlik.aktif ? "Aktif" : "Pasif"}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleAktif(etkinlik.id, etkinlik.aktif)}
                    >
                      {etkinlik.aktif ? "Pasife Al" : "Aktif Et"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleDelete(etkinlik.id)}
                    >
                      Sil
                    </Button>
                  </div>
                </div>
                {etkinlik.aciklama && (
                  <p className="text-sm text-gray-500">{etkinlik.aciklama}</p>
                )}
              </CardHeader>

              <Separator />

              <CardContent className="pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">
                    Saat Dilimleri
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedEtkinlik(etkinlik.id);
                      setSaatDialogOpen(true);
                      setError("");
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Saat Ekle
                  </Button>
                </div>

                {etkinlik.etkinlik_saatleri &&
                etkinlik.etkinlik_saatleri.length > 0 ? (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {etkinlik.etkinlik_saatleri.map((saat) => {
                      const dolulukOrani =
                        saat.kapasite > 0
                          ? (saat.kayit_sayisi / saat.kapasite) * 100
                          : 0;
                      return (
                        <div
                          key={saat.id}
                          className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {saat.saat}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <div className="h-1.5 w-20 rounded-full bg-gray-200">
                                <div
                                  className={`h-1.5 rounded-full transition-all ${
                                    dolulukOrani >= 90
                                      ? "bg-red-500"
                                      : dolulukOrani >= 50
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                  }`}
                                  style={{
                                    width: `${Math.min(dolulukOrani, 100)}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs text-gray-500">
                                {saat.kayit_sayisi}/{saat.kapasite}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-400 hover:text-blue-500"
                              title="Kapasiteyi Düzenle"
                              onClick={() => handleEditCapacity(etkinlik.id, saat.id, saat.kapasite)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                              title="Saati Sil"
                              onClick={() =>
                                handleDeleteSaat(etkinlik.id, saat.id)
                              }
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    Henüz saat dilimi eklenmemiş.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
