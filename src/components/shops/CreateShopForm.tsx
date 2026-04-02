import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface CreateShopFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateShopForm({ onSuccess, onCancel }: CreateShopFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    location: "",
    phone: "",
  });

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: generateSlug(name) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.name.trim() || !form.slug.trim()) {
      toast({ title: "Shop name is required", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from("shops").insert({
      user_id: user.id,
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      location: form.location.trim() || null,
      phone: form.phone.trim() || null,
      email: user.email || null,
    });

    if (error) {
      toast({
        title: "Error creating shop",
        description: error.message.includes("duplicate") ? "This shop name is already taken" : error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Shop created! 🎉" });
      onSuccess();
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="shop-name">Shop Name *</Label>
        <Input
          id="shop-name"
          value={form.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="My Awesome Shop"
          required
        />
      </div>
      <div>
        <Label htmlFor="shop-slug">Shop URL</Label>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
          sokoniarena.co.ke/shop/<span className="text-foreground font-medium">{form.slug || "your-shop"}</span>
        </div>
        <Input
          id="shop-slug"
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: generateSlug(e.target.value) }))}
          placeholder="my-awesome-shop"
        />
      </div>
      <div>
        <Label htmlFor="shop-description">Description</Label>
        <Textarea
          id="shop-description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Tell buyers about your shop..."
          rows={3}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="shop-location">Location</Label>
          <Input
            id="shop-location"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            placeholder="Nairobi, Kenya"
          />
        </div>
        <div>
          <Label htmlFor="shop-phone">Phone</Label>
          <Input
            id="shop-phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+254..."
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
          Create Shop
        </Button>
      </div>
    </form>
  );
}
