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
import { Badge } from "@/components/ui/badge";
import { Users, Edit, Loader2, Search } from "lucide-react";
import { format } from "date-fns";

interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  email: string;
  phone: string | null;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  created_at: string;
}

export function AdminUserEditor() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Record<string, string>>({});

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data) setUsers(data as UserProfile[]);
    setIsLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const openEditor = (user: UserProfile) => {
    setEditingUser(user);
    setForm({
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
      bio: user.bio || "",
      location: user.location || "",
      avatar_url: user.avatar_url || "",
    });
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        username: form.username.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        bio: form.bio.trim() || null,
        location: form.location.trim() || null,
        avatar_url: form.avatar_url.trim() || null,
      })
      .eq("user_id", editingUser.user_id);

    if (error) {
      toast({ title: "Error updating profile", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated successfully! ✅" });
      setEditingUser(null);
      fetchUsers();
    }
    setIsSaving(false);
  };

  const toggleVerified = async (user: UserProfile) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_verified: !user.is_verified })
      .eq("user_id", user.user_id);
    if (!error) {
      toast({ title: `User ${user.is_verified ? "unverified" : "verified"} ✅` });
      fetchUsers();
    }
  };

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const updateField = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  if (isLoading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />All Users</CardTitle>
          <CardDescription>Edit user profiles — username, email, phone, bio, and verification status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={user.is_verified ? "default" : "secondary"}>
                      {user.is_verified ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(user.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditor(user)}>
                      <Edit className="h-4 w-4 mr-1" />Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleVerified(user)}>
                      {user.is_verified ? "Unverify" : "Verify ✅"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User: {editingUser?.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Username</Label><Input value={form.username} onChange={(e) => updateField("username", e.target.value)} /></div>
            <div><Label>Email</Label><Input value={form.email} onChange={(e) => updateField("email", e.target.value)} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+254..." /></div>
            <div><Label>Location</Label><Input value={form.location} onChange={(e) => updateField("location", e.target.value)} /></div>
            <div><Label>Bio</Label><Textarea value={form.bio} onChange={(e) => updateField("bio", e.target.value)} rows={3} /></div>
            <div><Label>Avatar URL</Label><Input value={form.avatar_url} onChange={(e) => updateField("avatar_url", e.target.value)} /></div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
