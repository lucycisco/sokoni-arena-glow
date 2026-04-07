import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useShopBySlug, useShopFollow } from "@/hooks/useShops";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ListingCard } from "@/components/listings/ListingCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin, Star, Users, Eye, UserPlus, UserMinus, Package,
  Sparkles, Calendar, Loader2, MessageCircle, Store, CheckCircle,
  Crown, Phone, Mail, ExternalLink
} from "lucide-react";
import { FaWhatsapp, FaFacebook, FaInstagram, FaXTwitter, FaTiktok, FaYoutube, FaLinkedin, FaTelegram } from "react-icons/fa6";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ShopListing {
  id: string;
  title: string;
  price: number | null;
  original_price: number | null;
  images: string[];
  location: string;
  listing_type: "product" | "service" | "event";
  is_sponsored: boolean;
  is_featured: boolean;
  is_free: boolean;
  favorites_count: number | null;
  event_date: string | null;
}

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  username?: string;
  avatar_url?: string;
}

export default function ShopDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { shop, isLoading: shopLoading } = useShopBySlug(slug);
  const { user } = useAuth();
  const { toast } = useToast();
  const { isFollowing, toggleFollow, isLoading: followLoading } = useShopFollow(shop?.id);

  const [listings, setListings] = useState<ShopListing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [tab, setTab] = useState("products");

  useEffect(() => {
    if (!shop) return;
    const fetchListings = async () => {
      const { data } = await supabase
        .from("listings_public")
        .select("id, title, price, original_price, images, location, listing_type, is_sponsored, is_featured, is_free, favorites_count, event_date")
        .eq("shop_id", shop.id)
        .eq("status", "available")
        .order("created_at", { ascending: false });
      setListings((data as ShopListing[]) || []);
      setListingsLoading(false);
    };
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("shop_reviews")
        .select("*")
        .eq("shop_id", shop.id)
        .order("created_at", { ascending: false });
      if (data) {
        // Fetch usernames from profiles_public
        const userIds = data.map((r: any) => r.user_id);
        const { data: profiles } = await supabase
          .from("profiles_public")
          .select("user_id, username, avatar_url")
          .in("user_id", userIds);
        const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
        setReviews(
          data.map((r: any) => ({
            ...r,
            username: profileMap.get(r.user_id)?.username || "User",
            avatar_url: profileMap.get(r.user_id)?.avatar_url,
          }))
        );
      }
    };
    fetchListings();
    fetchReviews();
    // Increment views
    supabase.from("shops").update({ views_count: (shop.views_count || 0) + 1 }).eq("id", shop.id);
  }, [shop]);

  const handleSubmitReview = async () => {
    if (!user || !shop) {
      toast({ title: "Sign in to leave a review", variant: "destructive" });
      return;
    }
    setSubmittingReview(true);
    const { error } = await supabase
      .from("shop_reviews")
      .upsert({ shop_id: shop.id, user_id: user.id, rating: reviewRating, comment: reviewText || null }, { onConflict: "shop_id,user_id" });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Review submitted!" });
      setReviewText("");
      // Refetch reviews
      const { data } = await supabase.from("shop_reviews").select("*").eq("shop_id", shop.id).order("created_at", { ascending: false });
      if (data) {
        const userIds = data.map((r: any) => r.user_id);
        const { data: profiles } = await supabase.from("profiles_public").select("user_id, username, avatar_url").in("user_id", userIds);
        const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
        setReviews(data.map((r: any) => ({ ...r, username: profileMap.get(r.user_id)?.username || "User", avatar_url: profileMap.get(r.user_id)?.avatar_url })));
      }
    }
    setSubmittingReview(false);
  };

  const filteredListings = listings.filter((l) => {
    if (tab === "products") return l.listing_type === "product";
    if (tab === "services") return l.listing_type === "service";
    if (tab === "events") return l.listing_type === "event";
    return true;
  });

  const mapListing = (listing: ShopListing) => ({
    id: listing.id,
    title: listing.title,
    price: listing.price ?? undefined,
    originalPrice: listing.original_price ?? undefined,
    image: listing.images?.[0] || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&q=80",
    location: listing.location || "",
    category: listing.listing_type as "product" | "service" | "event",
    isSponsored: listing.is_sponsored || false,
    isFeatured: listing.is_featured || false,
    isFree: listing.is_free || false,
    eventDate: listing.event_date ? format(new Date(listing.event_date), "MMM d") : undefined,
  });

  if (shopLoading) {
    return (
      <Layout>
        <div className="container py-8 space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
      </Layout>
    );
  }

  if (!shop) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Shop Not Found</h1>
          <p className="text-muted-foreground mb-4">This shop doesn't exist or has been deactivated.</p>
          <Button asChild><Link to="/shops">Browse Shops</Link></Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        {shop.cover_image_url ? (
          <img src={shop.cover_image_url} alt={shop.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/40 via-accent/20 to-secondary/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      <div className="container relative -mt-16 pb-12">
        {/* Shop Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-card bg-card overflow-hidden shadow-lg shrink-0">
            {shop.logo_url ? (
              <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-4xl">
                {shop.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="font-display text-2xl md:text-3xl font-bold">{shop.name}</h1>
              {shop.is_verified && (
                <CheckCircle className="h-6 w-6 text-primary fill-primary/20" />
              )}
            </div>
            {shop.description && (
              <p className="text-muted-foreground mb-3 max-w-2xl">{shop.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
              {shop.location && (
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{shop.location}</span>
              )}
              <span className="flex items-center gap-1"><Users className="h-4 w-4" />{shop.followers_count} followers</span>
              <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{shop.views_count} views</span>
              <span className="flex items-center gap-1"><Package className="h-4 w-4" />{listings.length} listings</span>
              {shop.rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  {Number(shop.rating).toFixed(1)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={toggleFollow}
                variant={isFollowing ? "outline" : "default"}
                disabled={followLoading}
              >
                {isFollowing ? <UserMinus className="h-4 w-4 mr-1" /> : <UserPlus className="h-4 w-4 mr-1" />}
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
            </div>
          </div>
        </div>

        {/* Listings Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="w-full max-w-lg mb-6">
            <TabsTrigger value="products" className="flex-1 gap-1"><Package className="h-4 w-4" />Products</TabsTrigger>
            <TabsTrigger value="services" className="flex-1 gap-1"><Sparkles className="h-4 w-4" />Services</TabsTrigger>
            <TabsTrigger value="events" className="flex-1 gap-1"><Calendar className="h-4 w-4" />Events</TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1 gap-1"><MessageCircle className="h-4 w-4" />Reviews</TabsTrigger>
          </TabsList>

          {["products", "services", "events"].map((t) => (
            <TabsContent key={t} value={t} className="mt-0">
              {listingsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-[4/3] rounded-xl" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filteredListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredListings.map((l) => (
                    <ListingCard key={l.id} {...mapListing(l)} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No {t} in this shop yet
                </div>
              )}
            </TabsContent>
          ))}

          <TabsContent value="reviews" className="mt-0">
            {/* Review form */}
            {user && (
              <div className="mb-8 p-4 rounded-xl border bg-card">
                <h3 className="font-semibold mb-3">Leave a Review</h3>
                <div className="flex items-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setReviewRating(s)}>
                      <Star className={cn("h-6 w-6 transition-colors", s <= reviewRating ? "fill-gold text-gold" : "text-muted-foreground")} />
                    </button>
                  ))}
                </div>
                <Textarea
                  placeholder="Write your review..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="mb-3"
                />
                <Button onClick={handleSubmitReview} disabled={submittingReview}>
                  {submittingReview && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                  Submit Review
                </Button>
              </div>
            )}
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="p-4 rounded-xl border bg-card">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                        {review.avatar_url ? (
                          <img src={review.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-primary">{review.username?.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{review.username}</p>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={cn("h-3 w-3", s <= review.rating ? "fill-gold text-gold" : "text-muted-foreground")} />
                          ))}
                        </div>
                      </div>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {format(new Date(review.created_at), "MMM d, yyyy")}
                      </span>
                    </div>
                    {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">No reviews yet</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
