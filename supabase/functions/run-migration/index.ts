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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const dbUrl = Deno.env.get("SUPABASE_DB_URL")!;

    // Use pg directly for DDL
    const { default: postgres } = await import("https://deno.land/x/postgresjs@v3.4.5/mod.js");
    const sql = postgres(dbUrl);

    // Create enums
    await sql.unsafe(`
      DO $$ BEGIN
        CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
      DO $$ BEGIN
        CREATE TYPE public.listing_status AS ENUM ('available', 'sold', 'draft', 'expired');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
      DO $$ BEGIN
        CREATE TYPE public.listing_type AS ENUM ('product', 'service', 'event');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
      DO $$ BEGIN
        CREATE TYPE public.friend_status AS ENUM ('pending', 'accepted', 'rejected');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    console.log("Enums created");

    // Create tables
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS public.profiles (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
        username text,
        email text,
        phone text,
        avatar_url text,
        bio text,
        location text,
        is_verified boolean DEFAULT false,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS public.user_roles (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        role app_role NOT NULL DEFAULT 'user',
        created_at timestamptz DEFAULT now(),
        UNIQUE (user_id, role)
      );
      ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS public.shops (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        name text NOT NULL,
        slug text UNIQUE,
        description text,
        logo_url text,
        cover_image_url text,
        theme text DEFAULT 'default',
        is_active boolean DEFAULT true,
        is_verified boolean DEFAULT false,
        followers_count integer DEFAULT 0,
        views_count integer DEFAULT 0,
        rating numeric(3,1) DEFAULT 0,
        location text,
        phone text,
        email text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
      ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS public.listings (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        title text NOT NULL,
        description text,
        listing_type listing_type DEFAULT 'product',
        status listing_status DEFAULT 'available',
        price numeric(12,2) DEFAULT 0,
        original_price numeric(12,2),
        is_free boolean DEFAULT false,
        is_negotiable boolean DEFAULT true,
        images jsonb DEFAULT '[]'::jsonb,
        location text,
        latitude numeric,
        longitude numeric,
        delivery_available boolean DEFAULT false,
        event_date timestamptz,
        event_end_date timestamptz,
        category text,
        subcategory text,
        is_sponsored boolean DEFAULT false,
        is_featured boolean DEFAULT false,
        sponsored_until timestamptz,
        views_count integer DEFAULT 0,
        favorites_count integer DEFAULT 0,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        expires_at timestamptz,
        shop_id uuid REFERENCES public.shops(id) ON DELETE SET NULL
      );
      ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS public.conversations (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE,
        buyer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        seller_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        last_message_at timestamptz
      );
      ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS public.messages (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
        sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        content text NOT NULL,
        is_read boolean DEFAULT false,
        created_at timestamptz DEFAULT now()
      );
      ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS public.favorites (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
        created_at timestamptz DEFAULT now(),
        UNIQUE (user_id, listing_id)
      );
      ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS public.notifications (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        type text NOT NULL,
        title text NOT NULL,
        message text,
        read boolean DEFAULT false,
        metadata jsonb,
        created_at timestamptz DEFAULT now()
      );
      ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS public.audit_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
        user_email text,
        user_ip text,
        entity_type text,
        entity_id text,
        action text NOT NULL,
        old_data jsonb,
        new_data jsonb,
        metadata jsonb,
        created_at timestamptz DEFAULT now()
      );
      ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS public.sponsor_requests (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        status text DEFAULT 'pending',
        duration_days integer DEFAULT 7,
        requested_at timestamptz DEFAULT now(),
        reviewed_at timestamptz,
        reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
        admin_notes text,
        created_at timestamptz DEFAULT now()
      );
      ALTER TABLE public.sponsor_requests ENABLE ROW LEVEL SECURITY;
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS public.shop_followers (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        created_at timestamptz DEFAULT now(),
        UNIQUE (shop_id, user_id)
      );
      ALTER TABLE public.shop_followers ENABLE ROW LEVEL SECURITY;
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS public.shop_reviews (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        UNIQUE (shop_id, user_id)
      );
      ALTER TABLE public.shop_reviews ENABLE ROW LEVEL SECURITY;
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS public.shop_promotion_requests (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        status text DEFAULT 'pending',
        duration_days integer DEFAULT 7,
        requested_at timestamptz DEFAULT now(),
        reviewed_at timestamptz,
        reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
        admin_notes text,
        created_at timestamptz DEFAULT now()
      );
      ALTER TABLE public.shop_promotion_requests ENABLE ROW LEVEL SECURITY;
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS public.fun_circle_stories (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        content text,
        images jsonb DEFAULT '[]'::jsonb,
        expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
        created_at timestamptz DEFAULT now()
      );
      ALTER TABLE public.fun_circle_stories ENABLE ROW LEVEL SECURITY;
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS public.fun_circle_comments (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        story_id uuid REFERENCES public.fun_circle_stories(id) ON DELETE CASCADE NOT NULL,
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        content text NOT NULL,
        created_at timestamptz DEFAULT now()
      );
      ALTER TABLE public.fun_circle_comments ENABLE ROW LEVEL SECURITY;
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS public.fun_circle_mentions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        story_id uuid REFERENCES public.fun_circle_stories(id) ON DELETE CASCADE NOT NULL,
        mentioned_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        created_at timestamptz DEFAULT now()
      );
      ALTER TABLE public.fun_circle_mentions ENABLE ROW LEVEL SECURITY;
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS public.fun_circle_story_reactions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        story_id uuid REFERENCES public.fun_circle_stories(id) ON DELETE CASCADE NOT NULL,
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        reaction_type text NOT NULL DEFAULT 'like',
        created_at timestamptz DEFAULT now(),
        UNIQUE (story_id, user_id)
      );
      ALTER TABLE public.fun_circle_story_reactions ENABLE ROW LEVEL SECURITY;
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS public.fun_circle_friends (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        requester_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        addressee_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        status friend_status DEFAULT 'pending',
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
      ALTER TABLE public.fun_circle_friends ENABLE ROW LEVEL SECURITY;
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS public.fun_circle_conversations (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        participant_one uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        participant_two uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        created_at timestamptz DEFAULT now(),
        last_message_at timestamptz
      );
      ALTER TABLE public.fun_circle_conversations ENABLE ROW LEVEL SECURITY;
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS public.fun_circle_messages (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id uuid REFERENCES public.fun_circle_conversations(id) ON DELETE CASCADE NOT NULL,
        sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        content text NOT NULL,
        is_read boolean DEFAULT false,
        created_at timestamptz DEFAULT now()
      );
      ALTER TABLE public.fun_circle_messages ENABLE ROW LEVEL SECURITY;
    `);
    console.log("All tables created");

    // Create views
    await sql.unsafe(`
      CREATE OR REPLACE VIEW public.listings_public AS
      SELECT * FROM public.listings WHERE status != 'draft';
    `);
    await sql.unsafe(`
      CREATE OR REPLACE VIEW public.profiles_public AS
      SELECT user_id, username, avatar_url, location, bio, is_verified, created_at FROM public.profiles;
    `);
    console.log("Views created");

    // Create functions
    await sql.unsafe(`
      CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
      RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
      AS $fn$
        SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
      $fn$;
    `);

    await sql.unsafe(`
      CREATE OR REPLACE FUNCTION public.are_friends(_user_one uuid, _user_two uuid)
      RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
      AS $fn$
        SELECT EXISTS (
          SELECT 1 FROM public.fun_circle_friends
          WHERE status = 'accepted'
            AND ((requester_id = _user_one AND addressee_id = _user_two)
              OR (requester_id = _user_two AND addressee_id = _user_one))
        )
      $fn$;
    `);

    await sql.unsafe(`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
      AS $fn$
      BEGIN
        INSERT INTO public.profiles (user_id, username, email, phone)
        VALUES (
          NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
          NEW.email,
          NEW.raw_user_meta_data->>'phone'
        );
        INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
        RETURN NEW;
      END;
      $fn$;
    `);

    // Trigger - drop first to avoid duplicates
    await sql.unsafe(`
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `);

    await sql.unsafe(`
      CREATE OR REPLACE FUNCTION public.update_updated_at()
      RETURNS trigger LANGUAGE plpgsql
      AS $fn$
      BEGIN NEW.updated_at = now(); RETURN NEW; END;
      $fn$;
    `);

    const updateTriggerTables = ['profiles', 'shops', 'listings', 'conversations'];
    for (const t of updateTriggerTables) {
      await sql.unsafe(`
        DROP TRIGGER IF EXISTS update_${t}_updated_at ON public.${t};
        CREATE TRIGGER update_${t}_updated_at BEFORE UPDATE ON public.${t}
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
      `);
    }

    await sql.unsafe(`
      CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
      RETURNS trigger LANGUAGE plpgsql
      AS $fn$
      BEGIN
        UPDATE public.conversations SET last_message_at = NEW.created_at WHERE id = NEW.conversation_id;
        RETURN NEW;
      END;
      $fn$;
      DROP TRIGGER IF EXISTS update_conversation_last_message_trigger ON public.messages;
      CREATE TRIGGER update_conversation_last_message_trigger
        AFTER INSERT ON public.messages
        FOR EACH ROW EXECUTE FUNCTION public.update_conversation_last_message();
    `);

    await sql.unsafe(`
      CREATE OR REPLACE FUNCTION public.update_fc_conversation_last_message()
      RETURNS trigger LANGUAGE plpgsql
      AS $fn$
      BEGIN
        UPDATE public.fun_circle_conversations SET last_message_at = NEW.created_at WHERE id = NEW.conversation_id;
        RETURN NEW;
      END;
      $fn$;
      DROP TRIGGER IF EXISTS update_fc_conversation_last_message_trigger ON public.fun_circle_messages;
      CREATE TRIGGER update_fc_conversation_last_message_trigger
        AFTER INSERT ON public.fun_circle_messages
        FOR EACH ROW EXECUTE FUNCTION public.update_fc_conversation_last_message();
    `);
    console.log("Functions and triggers created");

    // RLS Policies - wrap each in a DO block to skip if exists
    const policies = [
      // AUDIT LOGS
      `CREATE POLICY "Only admins can view audit logs" ON public.audit_logs FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role))`,
      // CONVERSATIONS
      `CREATE POLICY "Users can view their own conversations" ON public.conversations FOR SELECT USING ((auth.uid() = buyer_id) OR (auth.uid() = seller_id))`,
      `CREATE POLICY "Authenticated users can create conversations" ON public.conversations FOR INSERT WITH CHECK ((auth.uid() = buyer_id))`,
      `CREATE POLICY "Participants can update conversations" ON public.conversations FOR UPDATE USING ((auth.uid() = buyer_id) OR (auth.uid() = seller_id))`,
      // FAVORITES
      `CREATE POLICY "Users can view their own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id)`,
      `CREATE POLICY "Users can add favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id)`,
      `CREATE POLICY "Users can remove their favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id)`,
      // FUN_CIRCLE_COMMENTS
      `CREATE POLICY "Users can view comments on visible stories" ON public.fun_circle_comments FOR SELECT USING (EXISTS (SELECT 1 FROM fun_circle_stories s WHERE s.id = fun_circle_comments.story_id AND s.expires_at > now()))`,
      `CREATE POLICY "Users can add comments to visible stories" ON public.fun_circle_comments FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM fun_circle_stories s WHERE s.id = fun_circle_comments.story_id AND s.expires_at > now()))`,
      `CREATE POLICY "Users can delete their own comments" ON public.fun_circle_comments FOR DELETE USING (auth.uid() = user_id)`,
      // FUN_CIRCLE_CONVERSATIONS
      `CREATE POLICY "Participants can view their fc conversations" ON public.fun_circle_conversations FOR SELECT USING ((auth.uid() = participant_one) OR (auth.uid() = participant_two))`,
      `CREATE POLICY "Users can create fc conversations with friends" ON public.fun_circle_conversations FOR INSERT WITH CHECK (((auth.uid() = participant_one) OR (auth.uid() = participant_two)) AND are_friends(participant_one, participant_two))`,
      `CREATE POLICY "Participants can update their fc conversations" ON public.fun_circle_conversations FOR UPDATE USING ((auth.uid() = participant_one) OR (auth.uid() = participant_two))`,
      // FUN_CIRCLE_FRIENDS
      `CREATE POLICY "Users can view their own friend requests" ON public.fun_circle_friends FOR SELECT USING ((auth.uid() = requester_id) OR (auth.uid() = addressee_id))`,
      `CREATE POLICY "Users can send friend requests" ON public.fun_circle_friends FOR INSERT WITH CHECK (auth.uid() = requester_id)`,
      `CREATE POLICY "Users can update friend requests they received" ON public.fun_circle_friends FOR UPDATE USING (auth.uid() = addressee_id)`,
      `CREATE POLICY "Users can delete their own friend connections" ON public.fun_circle_friends FOR DELETE USING ((auth.uid() = requester_id) OR (auth.uid() = addressee_id))`,
      // FUN_CIRCLE_MENTIONS
      `CREATE POLICY "Users can view mentions on visible stories" ON public.fun_circle_mentions FOR SELECT USING (EXISTS (SELECT 1 FROM fun_circle_stories s WHERE s.id = fun_circle_mentions.story_id AND s.expires_at > now()) OR (mentioned_user_id = auth.uid()))`,
      `CREATE POLICY "Story owners can add mentions" ON public.fun_circle_mentions FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM fun_circle_stories s WHERE s.id = fun_circle_mentions.story_id AND s.user_id = auth.uid()))`,
      `CREATE POLICY "Story owners can remove mentions" ON public.fun_circle_mentions FOR DELETE USING (EXISTS (SELECT 1 FROM fun_circle_stories s WHERE s.id = fun_circle_mentions.story_id AND s.user_id = auth.uid()))`,
      // FUN_CIRCLE_MESSAGES
      `CREATE POLICY "Participants can view fc messages" ON public.fun_circle_messages FOR SELECT USING (EXISTS (SELECT 1 FROM fun_circle_conversations c WHERE c.id = fun_circle_messages.conversation_id AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())))`,
      `CREATE POLICY "Participants can send fc messages" ON public.fun_circle_messages FOR INSERT WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM fun_circle_conversations c WHERE c.id = fun_circle_messages.conversation_id AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())))`,
      `CREATE POLICY "Recipients can mark fc messages as read" ON public.fun_circle_messages FOR UPDATE USING (EXISTS (SELECT 1 FROM fun_circle_conversations c WHERE c.id = fun_circle_messages.conversation_id AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())) AND (sender_id <> auth.uid()))`,
      // FUN_CIRCLE_STORIES
      `CREATE POLICY "Anyone can view non-expired stories" ON public.fun_circle_stories FOR SELECT USING (expires_at > now())`,
      `CREATE POLICY "Users can create their own stories" ON public.fun_circle_stories FOR INSERT WITH CHECK (auth.uid() = user_id)`,
      `CREATE POLICY "Users can delete their own stories" ON public.fun_circle_stories FOR DELETE USING (auth.uid() = user_id)`,
      // FUN_CIRCLE_STORY_REACTIONS
      `CREATE POLICY "Users can view reactions on visible stories" ON public.fun_circle_story_reactions FOR SELECT USING (EXISTS (SELECT 1 FROM fun_circle_stories s WHERE s.id = fun_circle_story_reactions.story_id AND s.expires_at > now()))`,
      `CREATE POLICY "Users can add reactions to visible stories" ON public.fun_circle_story_reactions FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM fun_circle_stories s WHERE s.id = fun_circle_story_reactions.story_id AND s.expires_at > now()))`,
      `CREATE POLICY "Users can update their own reactions" ON public.fun_circle_story_reactions FOR UPDATE USING (auth.uid() = user_id)`,
      `CREATE POLICY "Users can remove their reactions" ON public.fun_circle_story_reactions FOR DELETE USING (auth.uid() = user_id)`,
      // LISTINGS
      `CREATE POLICY "Published listings are viewable by everyone" ON public.listings FOR SELECT USING ((status <> 'draft'::listing_status) OR (auth.uid() = user_id))`,
      `CREATE POLICY "Users can create their own listings" ON public.listings FOR INSERT WITH CHECK (auth.uid() = user_id)`,
      `CREATE POLICY "Users can update their own listings" ON public.listings FOR UPDATE USING (auth.uid() = user_id)`,
      `CREATE POLICY "Users can delete their own listings" ON public.listings FOR DELETE USING (auth.uid() = user_id)`,
      `CREATE POLICY "Admins can manage all listings" ON public.listings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))`,
      // MESSAGES
      `CREATE POLICY "Conversation participants can view messages" ON public.messages FOR SELECT USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())))`,
      `CREATE POLICY "Conversation participants can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())))`,
      `CREATE POLICY "Recipients can mark messages as read" ON public.messages FOR UPDATE USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())) AND (sender_id <> auth.uid()))`,
      // NOTIFICATIONS
      `CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id)`,
      `CREATE POLICY "Admins can create notifications" ON public.notifications FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role))`,
      `CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id)`,
      // PROFILES
      `CREATE POLICY "Admins can view all profiles" ON public.profiles AS PERMISSIVE FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))`,
      `CREATE POLICY "Users can view their own profile" ON public.profiles AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = user_id)`,
      `CREATE POLICY "Deny anonymous access to profiles" ON public.profiles AS PERMISSIVE FOR SELECT TO anon USING (false)`,
      `CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id)`,
      `CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id)`,
      // SHOP_FOLLOWERS
      `CREATE POLICY "Users can follow shops" ON public.shop_followers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)`,
      `CREATE POLICY "Users can unfollow shops" ON public.shop_followers FOR DELETE TO authenticated USING (auth.uid() = user_id)`,
      `CREATE POLICY "Anyone can view shop followers" ON public.shop_followers FOR SELECT USING (true)`,
      // SHOP_REVIEWS
      `CREATE POLICY "Authenticated users can add reviews" ON public.shop_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)`,
      `CREATE POLICY "Users can update their own reviews" ON public.shop_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id)`,
      `CREATE POLICY "Users can delete their own reviews" ON public.shop_reviews FOR DELETE TO authenticated USING (auth.uid() = user_id)`,
      `CREATE POLICY "Anyone can view reviews" ON public.shop_reviews FOR SELECT USING (true)`,
      // SHOPS
      `CREATE POLICY "Users can create their own shop" ON public.shops FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)`,
      `CREATE POLICY "Users can update their own shop" ON public.shops FOR UPDATE TO authenticated USING (auth.uid() = user_id)`,
      `CREATE POLICY "Users can delete their own shop" ON public.shops FOR DELETE TO authenticated USING (auth.uid() = user_id)`,
      `CREATE POLICY "Admins can manage all shops" ON public.shops FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))`,
      `CREATE POLICY "Anyone can view active shops" ON public.shops FOR SELECT USING (is_active = true)`,
      // SPONSOR_REQUESTS
      `CREATE POLICY "Admins can view all sponsor requests" ON public.sponsor_requests FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role))`,
      `CREATE POLICY "Users can view their own sponsor requests" ON public.sponsor_requests FOR SELECT USING (auth.uid() = user_id)`,
      `CREATE POLICY "Users can create sponsor requests" ON public.sponsor_requests FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM listings WHERE listings.id = sponsor_requests.listing_id AND listings.user_id = auth.uid()))`,
      `CREATE POLICY "Admins can update sponsor requests" ON public.sponsor_requests FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role))`,
      // USER_ROLES
      `CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role))`,
      `CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id)`,
      `CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))`,
      // SHOP_PROMOTION_REQUESTS
      `CREATE POLICY "Admins can view all promotion requests" ON public.shop_promotion_requests FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role))`,
      `CREATE POLICY "Users can view their own promotion requests" ON public.shop_promotion_requests FOR SELECT USING (auth.uid() = user_id)`,
      `CREATE POLICY "Users can create promotion requests" ON public.shop_promotion_requests FOR INSERT WITH CHECK (auth.uid() = user_id)`,
      `CREATE POLICY "Admins can update promotion requests" ON public.shop_promotion_requests FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role))`,
    ];

    for (const p of policies) {
      try {
        await sql.unsafe(p);
      } catch (e) {
        console.log(`Policy skipped (may already exist): ${e.message?.slice(0, 80)}`);
      }
    }
    console.log("RLS policies created");

    // Storage buckets
    try {
      await sql.unsafe(`INSERT INTO storage.buckets (id, name, public) VALUES ('fun-circle', 'fun-circle', true) ON CONFLICT (id) DO NOTHING`);
      await sql.unsafe(`INSERT INTO storage.buckets (id, name, public) VALUES ('email-assets', 'email-assets', true) ON CONFLICT (id) DO NOTHING`);
    } catch (e) {
      console.log("Storage bucket creation:", e.message);
    }

    // Storage policies
    const storagePolicies = [
      `CREATE POLICY "Anyone can view fun circle images" ON storage.objects FOR SELECT USING (bucket_id = 'fun-circle'::text)`,
      `CREATE POLICY "Email assets are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'email-assets'::text)`,
      `CREATE POLICY "Authenticated users can upload fun circle images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'fun-circle'::text AND auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = (auth.uid())::text)`,
      `CREATE POLICY "Users can delete their own fun circle images" ON storage.objects FOR DELETE USING (bucket_id = 'fun-circle'::text AND (auth.uid())::text = (storage.foldername(name))[1])`,
    ];
    for (const p of storagePolicies) {
      try { await sql.unsafe(p); } catch (e) { console.log(`Storage policy skipped: ${e.message?.slice(0, 80)}`); }
    }
    console.log("Storage buckets and policies created");

    // Indexes
    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_listings_user_id ON public.listings(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status)`,
      `CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category)`,
      `CREATE INDEX IF NOT EXISTS idx_listings_shop_id ON public.listings(shop_id)`,
      `CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON public.conversations(buyer_id)`,
      `CREATE INDEX IF NOT EXISTS idx_conversations_seller ON public.conversations(seller_id)`,
      `CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id)`,
      `CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_profiles_user ON public.profiles(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_fun_circle_stories_user ON public.fun_circle_stories(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_fun_circle_stories_expires ON public.fun_circle_stories(expires_at)`,
      `CREATE INDEX IF NOT EXISTS idx_fun_circle_friends_requester ON public.fun_circle_friends(requester_id)`,
      `CREATE INDEX IF NOT EXISTS idx_fun_circle_friends_addressee ON public.fun_circle_friends(addressee_id)`,
      `CREATE INDEX IF NOT EXISTS idx_shops_user ON public.shops(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_shops_slug ON public.shops(slug)`,
    ];
    for (const idx of indexes) {
      await sql.unsafe(idx);
    }
    console.log("Indexes created");

    // Realtime
    try {
      await sql.unsafe(`ALTER PUBLICATION supabase_realtime ADD TABLE public.messages`);
    } catch(e) { console.log("Realtime messages:", e.message?.slice(0,60)); }
    try {
      await sql.unsafe(`ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations`);
    } catch(e) { console.log("Realtime conversations:", e.message?.slice(0,60)); }
    try {
      await sql.unsafe(`ALTER PUBLICATION supabase_realtime ADD TABLE public.fun_circle_messages`);
    } catch(e) { console.log("Realtime fc messages:", e.message?.slice(0,60)); }
    try {
      await sql.unsafe(`ALTER PUBLICATION supabase_realtime ADD TABLE public.fun_circle_stories`);
    } catch(e) { console.log("Realtime fc stories:", e.message?.slice(0,60)); }
    try {
      await sql.unsafe(`ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications`);
    } catch(e) { console.log("Realtime notifications:", e.message?.slice(0,60)); }
    console.log("Realtime enabled");

    await sql.end();

    return new Response(JSON.stringify({ success: true, message: "All tables, views, functions, triggers, RLS policies, storage buckets, indexes, and realtime created successfully!" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Migration error:", error);
    return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
