import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, X, Clock, Crown, Loader2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/untyped-client";
import { format } from "date-fns";

export function ShopPromotionsManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchRequests = async () => {
    setIsLoading(true);
    const { data } = await (supabase.from("shop_promotion_requests" as any) as any).select("*").order("requested_at", { ascending: false });
    if (data) {
      const shopIds = [...new Set(data.map((r: any) => r.shop_id))];
      const userIds = [...new Set(data.map((r: any) => r.user_id))];
      const [{ data: shops }, { data: profiles }] = await Promise.all([
        supabase.from("shops").select("id, name, logo_url").in("id", shopIds as string[]),
        supabase.from("profiles").select("user_id, username, email").in("user_id", userIds as string[]),
      ]);
      const sMap = new Map((shops || []).map((s: any) => [s.id, s]));
      const pMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      setRequests(data.map((r: any) => ({ ...r, shop: sMap.get(r.shop_id), profile: pMap.get(r.user_id) })));
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (action: "approved" | "rejected") => {
    if (!selected || !user) return;
    setIsProcessing(true);
    const { error } = await (supabase.from("shop_promotion_requests" as any) as any).update({
      status: action, reviewed_at: new Date().toISOString(), reviewed_by: user.id, admin_notes: adminNotes || null,
    }).eq("id", selected.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: action === "approved" ? "Shop promotion approved!" : "Promotion request declined." });
      setSelected(null);
      setAdminNotes("");
      fetchRequests();
    }
    setIsProcessing(false);
  };

  const pendingCount = requests.filter((r: any) => r.status === "pending").length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Crown className="h-5 w-5 text-gold" />Shop Promotions</CardTitle>
            <CardDescription>Review shop promotion requests</CardDescription>
          </div>
          {pendingCount > 0 && <Badge variant="destructive">{pendingCount} Pending</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : requests.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No shop promotion requests yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req: any) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.shop?.name || "Unknown"}</TableCell>
                  <TableCell>
                    <p className="font-medium">{req.profile?.username}</p>
                    <p className="text-xs text-muted-foreground">{req.profile?.email}</p>
                  </TableCell>
                  <TableCell>{req.duration_days} days</TableCell>
                  <TableCell>{format(new Date(req.requested_at), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <Badge variant={req.status === "approved" ? "default" : req.status === "rejected" ? "destructive" : "secondary"}>
                      {req.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant={req.status === "pending" ? "default" : "ghost"} onClick={() => { setSelected(req); setAdminNotes(req.admin_notes || ""); }}>
                      {req.status === "pending" ? "Review" : <Eye className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selected?.status === "pending" ? "Review Shop Promotion" : "Promotion Details"}</DialogTitle>
              <DialogDescription>{selected?.shop?.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Owner</p><p className="font-medium">{selected?.profile?.username}</p></div>
                <div><p className="text-muted-foreground">Duration</p><p className="font-medium">{selected?.duration_days} days</p></div>
              </div>
              {selected?.status === "pending" ? (
                <>
                  <div className="space-y-2">
                    <Label>Admin Notes</Label>
                    <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Notes..." rows={3} />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button variant="destructive" onClick={() => handleAction("rejected")} disabled={isProcessing}>
                      <X className="h-4 w-4" />Decline
                    </Button>
                    <Button onClick={() => handleAction("approved")} disabled={isProcessing}>
                      <Check className="h-4 w-4" />Approve
                    </Button>
                  </div>
                </>
              ) : selected?.admin_notes && (
                <div className="p-3 rounded-lg bg-muted text-sm">{selected.admin_notes}</div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
