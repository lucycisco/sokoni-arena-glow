import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const body = await req.json();
    const { action, data } = body;
    const results: string[] = [];

    if (action === "clear") {
      // Clear all data in reverse dependency order
      const tables = [
        "fun_circle_messages", "fun_circle_conversations", "fun_circle_story_reactions",
        "fun_circle_comments", "fun_circle_mentions", "fun_circle_stories", "fun_circle_friends",
        "messages", "conversations", "favorites", "notifications",
        "sponsor_requests", "featured_requests", "shop_promotion_requests",
        "shop_followers", "shop_reviews", "listings", "shops",
        "shop_creation_requests", "audit_logs", "user_roles", "profiles"
      ];
      for (const t of tables) {
        const { error } = await admin.from(t).delete().neq("id", "00000000-0000-0000-0000-000000000000");
        results.push(`${t}: ${error ? error.message : "cleared"}`);
      }
      // Delete all auth users
      const { data: authUsers } = await admin.auth.admin.listUsers({ perPage: 1000 });
      if (authUsers?.users) {
        for (const u of authUsers.users) {
          await admin.auth.admin.deleteUser(u.id);
        }
        results.push(`auth.users: deleted ${authUsers.users.length}`);
      }
      return new Response(JSON.stringify({ results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "seed_auth") {
      const users = data.auth_users || [];
      for (const u of users) {
        const { error } = await admin.auth.admin.createUser({
          user_metadata: { username: u.email.split("@")[0] },
          email: u.email,
          password: "Francis@1234",
          email_confirm: true,
          id: u.id,
        });
        if (error && !error.message.includes("already")) {
          results.push(`auth ${u.email}: ${error.message}`);
        }
      }
      // Seed user_roles
      if (data.user_roles?.length) {
        const { error } = await admin.from("user_roles").upsert(data.user_roles, { onConflict: "id" });
        results.push(`user_roles: ${error ? error.message : `${data.user_roles.length} rows`}`);
      }
      return new Response(JSON.stringify({ results, count: users.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "seed_table") {
      const { table, rows } = data;
      if (rows?.length) {
        // Batch in groups of 50
        for (let i = 0; i < rows.length; i += 50) {
          const batch = rows.slice(i, i + 50);
          const { error } = await admin.from(table).upsert(batch, { onConflict: "id" });
          if (error) results.push(`${table} batch ${i}: ${error.message}`);
        }
        results.push(`${table}: ${rows.length} rows inserted`);
      }
      return new Response(JSON.stringify({ results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
