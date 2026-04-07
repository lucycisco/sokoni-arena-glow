import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, users, statements } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const dbUrl = Deno.env.get("SUPABASE_DB_URL")!;

    if (action === "create_users") {
      const supabase = createClient(supabaseUrl, serviceKey);
      let created = 0;
      let skipped = 0;
      const errors: string[] = [];
      
      for (const u of users) {
        try {
          const { error } = await supabase.auth.admin.createUser({
            id: u.id,
            email: u.email,
            password: "TempPass123!",
            email_confirm: true,
          });
          if (error) {
            if (error.message.includes("already been registered")) {
              skipped++;
            } else {
              errors.push(`${u.email}: ${error.message}`);
            }
          } else {
            created++;
          }
        } catch (e) {
          errors.push(`${u.email}: ${e.message}`);
        }
      }
      
      return new Response(JSON.stringify({ created, skipped, errors: errors.slice(0, 10) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "run_sql") {
      const { default: postgres } = await import("https://deno.land/x/postgresjs@v3.4.5/mod.js");
      const sql = postgres(dbUrl);
      
      let success = 0;
      const errors: string[] = [];
      
      for (const stmt of statements) {
        try {
          await sql.unsafe(stmt);
          success++;
        } catch (e) {
          errors.push(`${e.message?.slice(0, 100)} | SQL: ${stmt.slice(0, 80)}`);
        }
      }
      
      await sql.end();
      
      return new Response(JSON.stringify({ success, total: statements.length, errors: errors.slice(0, 20) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
