
-- Create shops table
CREATE TABLE public.shops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  theme TEXT DEFAULT 'default',
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  followers_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 0,
  location TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add shop_id to listings (nullable for backward compat)
ALTER TABLE public.listings ADD COLUMN shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL;

-- Create shop_followers table
CREATE TABLE public.shop_followers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(shop_id, user_id)
);

-- Create shop_reviews table
CREATE TABLE public.shop_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(shop_id, user_id)
);

-- Enable RLS
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_reviews ENABLE ROW LEVEL SECURITY;

-- Shops RLS
CREATE POLICY "Anyone can view active shops" ON public.shops FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create their own shop" ON public.shops FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own shop" ON public.shops FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own shop" ON public.shops FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all shops" ON public.shops FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Shop followers RLS
CREATE POLICY "Anyone can view shop followers" ON public.shop_followers FOR SELECT USING (true);
CREATE POLICY "Users can follow shops" ON public.shop_followers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unfollow shops" ON public.shop_followers FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Shop reviews RLS
CREATE POLICY "Anyone can view reviews" ON public.shop_reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add reviews" ON public.shop_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.shop_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.shop_reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Trigger to update followers_count
CREATE OR REPLACE FUNCTION public.update_shop_followers_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.shops SET followers_count = followers_count + 1 WHERE id = NEW.shop_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.shops SET followers_count = followers_count - 1 WHERE id = OLD.shop_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_shop_follower_change
AFTER INSERT OR DELETE ON public.shop_followers
FOR EACH ROW EXECUTE FUNCTION public.update_shop_followers_count();

-- Trigger to update shop rating
CREATE OR REPLACE FUNCTION public.update_shop_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  avg_rating NUMERIC;
BEGIN
  SELECT COALESCE(AVG(rating), 0) INTO avg_rating
  FROM public.shop_reviews
  WHERE shop_id = COALESCE(NEW.shop_id, OLD.shop_id);
  
  UPDATE public.shops SET rating = ROUND(avg_rating, 1) WHERE id = COALESCE(NEW.shop_id, OLD.shop_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_shop_review_change
AFTER INSERT OR UPDATE OR DELETE ON public.shop_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_shop_rating();

-- Update updated_at trigger for shops
CREATE TRIGGER update_shops_updated_at
BEFORE UPDATE ON public.shops
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update listings_public view to include shop_id
DROP VIEW IF EXISTS public.listings_public;
CREATE VIEW public.listings_public WITH (security_invoker = on) AS
SELECT 
  id, title, description, listing_type, category, subcategory, location,
  price, original_price, is_free, is_negotiable, delivery_available,
  event_date, event_end_date, images, status, is_sponsored, is_featured,
  sponsored_until, expires_at, views_count, favorites_count,
  user_id, shop_id, created_at, updated_at
FROM public.listings
WHERE status <> 'draft';
