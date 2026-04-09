"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

export default function KademelerPage() {
  const [kademeler, setKademeler] = useState<Kademe[]>([]);
  const [loading, setLoading] = useState(true);
  const [kademeDialogOpen, setKademeDialogOpen] = useState(false);
  const [sinifDialogOpen, setSinifDialogOpen] = useState(false);
  const [kademeAd, setKademeAd] = useState("");
  const [sinifForm, setSinifForm] = useState({
    kademe_id: "",
    sinif_no: "",
    sube: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchKademeler = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/kademeler");
      const data = await res.json();
      if (data.success) {
        setKademeler(data.data || []);
      }
    } catch {
      console.error("Kademeler yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKademeler();
  }, [fetchKademeler]);

  const handleCreateKademe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/kademeler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ad: kademeAd }),
      });
      const data = await res.json();
      if (data.success) {
        setKademeDialogOpen(false);
        setKademeAd("");
        fetchKademeler();
      } else {
        setError(data.message);
      }
    } catch {
      setError("Bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteKademe = async (id: string) => {
    if (!confirm("Bu kademeyi silmek istediğinize emin misiniz?")) return;
    try {
      await fetch(`/api/admin/kademeler/${id}`, { method: "DELETE" });
      fetchKademeler();
    } catch {
      console.error("Silme başarısız");
    }
  };

  const handleCreateSinif = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/siniflar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sinifForm),
      });
      const data = await res.json();
      if (data.success) {
        setSinifDialogOpen(false);
        setSinifForm({ kademe_id: "", sinif_no: "", sube: "" });
        fetchKademeler();
      } else {
        setError(data.message);
      }
    } catch {
      setError("Bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSinif = async (id: string) => {
    if (!confirm("Bu sınıfı silmek istediğinize emin misiniz?")) return;
    try {
      await fetch(`/api/admin/siniflar/${id}`, { method: "DELETE" });
      fetchKademeler();
    } catch {
      console.error("Silme başarısız");
    }
  };

  if (loading) {
    return (
      <div>
        <div className="mb-8 flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kademeler & Sınıflar</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kademe ve sınıf yapısını yönetin
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={kademeDialogOpen} onOpenChange={setKademeDialogOpen}>
            <DialogTrigger
              render={<Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" />}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Yeni Kademe
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Kademe Oluştur</DialogTitle>
                <DialogDescription>Kademe adını girin.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateKademe} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="kademe-ad">Kademe Adı</Label>
                  <Input
                    id="kademe-ad"
                    placeholder="Örn: 1. Sınıf"
                    value={kademeAd}
                    onChange={(e) => setKademeAd(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setKademeDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={sinifDialogOpen} onOpenChange={setSinifDialogOpen}>
            <DialogTrigger
              render={<Button variant="outline" />}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Yeni Sınıf
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Sınıf Oluştur</DialogTitle>
                <DialogDescription>Sınıf bilgilerini doldurun.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSinif} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label>Kademe</Label>
                  <Select
                    value={sinifForm.kademe_id}
                    onValueChange={(v) =>
                      setSinifForm({ ...sinifForm, kademe_id: v ?? "" })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kademe seçin" />
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sinif-no">Sınıf No</Label>
                    <Input
                      id="sinif-no"
                      placeholder="Örn: 1"
                      value={sinifForm.sinif_no}
                      onChange={(e) =>
                        setSinifForm({ ...sinifForm, sinif_no: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sube">Şube</Label>
                    <Input
                      id="sube"
                      placeholder="Örn: A"
                      value={sinifForm.sube}
                      onChange={(e) =>
                        setSinifForm({ ...sinifForm, sube: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setSinifDialogOpen(false)}>
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
      </div>

      {kademeler.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mb-4 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-lg font-medium text-gray-600">
              Henüz kademe oluşturulmamış
            </p>
            <p className="mt-1 text-sm text-gray-400">
              &quot;Yeni Kademe&quot; butonunu kullanarak başlayın.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kademeler.map((kademe) => (
            <Card key={kademe.id} className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{kademe.ad}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                    onClick={() => handleDeleteKademe(kademe.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {kademe.siniflar && kademe.siniflar.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {kademe.siniflar.map((sinif) => (
                      <Badge
                        key={sinif.id}
                        variant="secondary"
                        className="flex items-center gap-1 pl-3 pr-1 py-1"
                      >
                        {sinif.sinif_no}-{sinif.sube}
                        <button
                          className="ml-1 rounded-full p-0.5 hover:bg-gray-300/50 transition-colors"
                          onClick={() => handleDeleteSinif(sinif.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Henüz sınıf eklenmemiş</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
