import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/untyped-client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CloudinaryImageUpload } from "@/components/shared/CloudinaryImageUpload";
import { Megaphone, Plus, Edit, Trash2, Loader2, Search, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface ShopAd {
  id: string;
  shop_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  is_active: boolean;
  position: string;
  created_at: string;
  shop_name?: string;
}

interface ShopOption {
  id: string;
  name: string;
}

interface ShopAdsManagerProps {
  shopId?: string;
  shopName?: string;
  isAdmin?: boolean;
}

export function ShopAdsManager({ shopId, shopName, isAdmin = false }: ShopAdsManagerProps) {
  const { toast } = useToast();
  const [ads, setAds] = useState<ShopAd[]>([]);
  const [shops, setShops] = useState<ShopOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAd, setEditingAd] = useState<ShopAd | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    shop_id: shopId || "",
    title: "",
    description: "",
    image_url: "",
    link_url: "",
    is_active: true,
    position: "banner",
  });

  const fetchAds = async () => {
    setIsLoading(true);
    let query = supabase.from("shop_ads").select("*").order("created_at", { ascending: false });
    if (shopId) query = query.eq("shop_id", shopId);
    const { data } = await query;

    if (data && isAdmin && !shopId) {
      const shopIds = [...new Set(data.map((a: any) => a.shop_id))];
      const { data: shopData } = await supabase.from("shops").select("id, name").in("id", shopIds);
      const shopMap = new Map((shopData || []).map((s: any) => [s.id, s.name]));
      setAds(data.map((a: any) => ({ ...a, shop_name: shopMap.get(a.shop_id) || "Unknown" })));
    } else {
      setAds((data as ShopAd[]) || []);
    }
    setIsLoading(false);
  };

  const fetchShops = async () => {
    if (!isAdmin) return;
    const { data } = await supabase.from("shops").select("id, name").eq("is_active", true).order("name");
    if (data) setShops(data as ShopOption[]);
  };

  useEffect(() => {
    fetchAds();
    fetchShops();
  }, [shopId]);

  const resetForm = () => {
    setForm({
      shop_id: shopId || "",
      title: "",
      description: "",
      image_url: "",
      link_url: "",
      is_active: true,
      position: "banner",
    });
  };

  const openCreate = () => {
    resetForm();
    setEditingAd(null);
    setIsCreating(true);
  };

  const openEdit = (ad: ShopAd) => {
    setEditingAd(ad);
    setForm({
      shop_id: ad.shop_id,
      title: ad.title,
      description: ad.description || "",
      image_url: ad.image_url || "",
      link_url: ad.link_url || "",
      is_active: ad.is_active,
      position: ad.position || "banner",
    });
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    if (!form.shop_id) {
      toast({ title: "Please select a shop", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    const payload = {
      shop_id: form.shop_id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      link_url: form.link_url.trim() || null,
      is_active: form.is_active,
      position: form.position,
    };

    if (editingAd) {
      const { error } = await supabase.from("shop_ads").update(payload).eq("id", editingAd.id);
      if (error) {
        toast({ title: "Error updating ad", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Ad updated ✅" });
      }
    } else {
      const { error } = await supabase.from("shop_ads").insert(payload);
      if (error) {
        toast({ title: "Error creating ad", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Ad created ✅" });
      }
    }
    setIsSaving(false);
    setIsCreating(false);
    fetchAds();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("shop_ads").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting ad", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Ad deleted" });
      fetchAds();
    }
  };

  const toggleActive = async (ad: ShopAd) => {
    await supabase.from("shop_ads").update({ is_active: !ad.is_active }).eq("id", ad.id);
    fetchAds();
  };

  const updateField = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const filtered = ads.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.shop_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                {shopName ? `${shopName} Ads` : "Shop Advertisements"}
              </CardTitle>
              <CardDescription>
                {isAdmin ? "Manage ads across all shops" : "Create and manage your shop ads"}
              </CardDescription>
            </div>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-1" />
              New Ad
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search ads..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No ads yet. Create your first ad!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad</TableHead>
                  {isAdmin && !shopId && <TableHead>Shop</TableHead>}
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((ad) => (
                  <TableRow key={ad.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {ad.image_url && (
                          <img src={ad.image_url} alt="" className="w-12 h-12 rounded object-cover" />
                        )}
                        <div>
                          <p className="font-medium">{ad.title}</p>
                          {ad.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{ad.description}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    {isAdmin && !shopId && <TableCell>{ad.shop_name}</TableCell>}
                    <TableCell>
                      <Badge variant="secondary">{ad.position}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ad.is_active ? "default" : "destructive"}>
                        {ad.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(ad.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(ad)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => toggleActive(ad)}>
                        {ad.is_active ? "Pause" : "Resume"}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(ad.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreating} onOpenChange={(open) => !open && setIsCreating(false)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAd ? "Edit Ad" : "Create New Ad"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {isAdmin && !shopId && (
              <div>
                <Label>Shop</Label>
                <Select value={form.shop_id} onValueChange={(v) => updateField("shop_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Select a shop" /></SelectTrigger>
                  <SelectContent>
                    {shops.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => updateField("title", e.target.value)} placeholder="Ad title" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Ad description..." rows={3} />
            </div>
            <div>
              <Label>Ad Image</Label>
              <CloudinaryImageUpload
                value={form.image_url}
                onChange={(url) => updateField("image_url", url)}
                label="Upload Ad Image"
                aspectRatio="aspect-video"
              />
            </div>
            <div>
              <Label>Link URL (optional)</Label>
              <Input value={form.link_url} onChange={(e) => updateField("link_url", e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label>Position</Label>
              <Select value={form.position} onValueChange={(v) => updateField("position", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="banner">Banner (top)</SelectItem>
                  <SelectItem value="sidebar">Sidebar</SelectItem>
                  <SelectItem value="inline">Inline (between listings)</SelectItem>
                  <SelectItem value="footer">Footer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => updateField("is_active", v)} />
              <Label>Active</Label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                {editingAd ? "Save Changes" : "Create Ad"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
