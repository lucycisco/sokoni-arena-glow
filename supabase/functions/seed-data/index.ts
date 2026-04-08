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
  const dbUrl = Deno.env.get("SUPABASE_DB_URL")!;
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const body = await req.json();
    const { action, data } = body;
    const results: string[] = [];

    if (action === "migrate") {
      // Use pg driver to run raw SQL
      const { default: postgres } = await import("https://deno.land/x/postgresjs@v3.4.4/mod.js");
      const sql = postgres(dbUrl);
      try {
        await sql.unsafe(data.sql);
        results.push("migration applied successfully");
      } catch (e) {
        results.push(`migration error: ${(e as Error).message}`);
      } finally {
        await sql.end();
      }
      return new Response(JSON.stringify({ results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "clear") {
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
        if (error && !error.message.includes("Could not find")) {
          results.push(`${t}: ${error.message}`);
        }
      }
      // Delete auth users in pages
      let page = 1;
      let totalDeleted = 0;
      while (true) {
        const { data: res } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
        if (!res?.users?.length) break;
        for (const u of res.users) {
          await admin.auth.admin.deleteUser(u.id);
          totalDeleted++;
        }
        page++;
      }
      results.push(`Cleared all tables. Deleted ${totalDeleted} auth users.`);
      return new Response(JSON.stringify({ results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "seed_auth") {
      const users = data.auth_users || [];
      let created = 0, errors = 0;
      for (const u of users) {
        const { error } = await admin.auth.admin.createUser({
          user_metadata: { username: u.email.split("@")[0] },
          email: u.email,
          password: "Francis@1234",
          email_confirm: true,
          id: u.id,
        });
        if (error && !error.message.includes("already")) {
          errors++;
          if (errors <= 5) results.push(`auth ${u.email}: ${error.message}`);
        } else {
          created++;
        }
      }
      results.push(`auth users: ${created} created, ${errors} errors`);
      
      if (data.user_roles?.length) {
        const { error } = await admin.from("user_roles").upsert(data.user_roles, { onConflict: "id" });
        results.push(`user_roles: ${error ? error.message : `${data.user_roles.length} rows`}`);
      }
      return new Response(JSON.stringify({ results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "seed_table") {
      const { table, rows } = data;
      if (rows?.length) {
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
