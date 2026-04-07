import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, MailOpen, Loader2, Inbox } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface DashMessage {
  id: string;
  subject: string;
  content: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export function DashboardMessages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DashMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMessages = async () => {
    if (!user) return;
    const { data } = await (supabase.from("dashboard_messages" as any) as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setMessages((data as DashMessage[]) || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchMessages(); }, [user]);

  const markRead = async (id: string) => {
    await (supabase.from("dashboard_messages" as any) as any).update({ is_read: true }).eq("id", id);
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, is_read: true } : m));
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (messages.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Inbox className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="font-display text-xl font-bold mb-2">No Messages</h3>
          <p className="text-muted-foreground">Messages from the admin team will appear here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <Card key={msg.id} className={msg.is_read ? "opacity-70" : "border-primary/30"}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                {msg.is_read ? (
                  <MailOpen className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                ) : (
                  <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm truncate">{msg.subject}</h4>
                    {!msg.is_read && <Badge variant="default" className="text-xs">New</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(new Date(msg.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
              {!msg.is_read && (
                <Button variant="ghost" size="sm" onClick={() => markRead(msg.id)}>
                  Mark Read
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
