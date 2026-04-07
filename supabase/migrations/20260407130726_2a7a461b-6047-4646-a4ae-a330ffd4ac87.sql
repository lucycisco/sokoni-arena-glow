
DROP VIEW IF EXISTS public.listings_public;
CREATE VIEW public.listings_public WITH (security_invoker = on) AS
SELECT 
  id, user_id, title, description, listing_type, status, price, original_price,
  is_free, is_negotiable, images, location, delivery_available, event_date,
  event_end_date, category, subcategory, is_sponsored, is_featured,
  sponsored_until, views_count, favorites_count, created_at, updated_at,
  expires_at, shop_id
FROM public.listings
WHERE status <> 'draft';
