import { useState, useEffect } from "react";
import { Crown, Loader2, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ShopPromotionButtonProps {
  shopId: string;
  shopName: string;
}

export function ShopPromotionButton({ shopId, shopName }: ShopPromotionButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [duration, setDuration] = useState("7");

  useEffect(() => {
    if (user && shopId) {
      (supabase.from("shop_promotion_requests" as any) as any)
        .select("*")
        .eq("shop_id", shopId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data }: any) => setExistingRequest(data));
    }
  }, [user, shopId]);

  const handleSubmit = async () => {
    if (!user) return;
    setIsLoading(true);
    const { error } = await (supabase.from("shop_promotion_requests" as any) as any).insert({
      shop_id: shopId,
      user_id: user.id,
      duration_days: parseInt(duration),
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Promotion request submitted!", description: "Pending admin approval." });
      setIsOpen(false);
      const { data } = await (supabase.from("shop_promotion_requests" as any) as any).select("*").eq("shop_id", shopId).eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      setExistingRequest(data);
    }
    setIsLoading(false);
  };

  if (existingRequest) {
    const cfg: Record<string, any> = {
      pending: { icon: Clock, color: "bg-amber-100 text-amber-700", label: "Pending" },
      approved: { icon: CheckCircle, color: "bg-green-100 text-green-700", label: "Promoted" },
      rejected: { icon: XCircle, color: "bg-red-100 text-red-700", label: "Declined" },
    };
    const c = cfg[existingRequest.status] || cfg.pending;
    const Icon = c.icon;
    return <Badge className={c.color}><Icon className="h-3 w-3 mr-1" />Promo: {c.label}</Badge>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Crown className="h-4 w-4" />Promote Shop
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Promote Your Shop</DialogTitle>
          <DialogDescription>Request premium placement for "{shopName}". Admin approval required.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Promotion Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="14">14 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="p-4 rounded-lg bg-muted">
            <h4 className="font-medium mb-2">Premium Shop Benefits:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Featured on homepage premium section</li>
              <li>• Name highlighted in top shops bar</li>
              <li>• Priority in shop search results</li>
              <li>• Crown badge on your shop</li>
            </ul>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}Submit Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
