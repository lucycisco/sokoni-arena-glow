import { memo } from "react";
import { Link } from "react-router-dom";
import { MapPin, Star, Users, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { cn } from "@/lib/utils";
import type { Shop } from "@/hooks/useShops";

interface ShopCardProps {
  shop: Shop;
}

export const ShopCard = memo(function ShopCard({ shop }: ShopCardProps) {
  return (
    <Link to={`/shop/${shop.slug}`} className="group block">
      <article className="listing-card flex flex-col h-full overflow-hidden">
        {/* Cover Image */}
        <div className="relative h-32 overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
          {shop.cover_image_url ? (
            <OptimizedImage
              src={shop.cover_image_url}
              alt={shop.name}
              className="w-full h-full transition-transform duration-500 group-hover:scale-110"
              width={400}
              priority={false}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30" />
          )}
          {shop.is_verified && (
            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">
              ✓ Verified
            </Badge>
          )}
        </div>

        {/* Logo overlay */}
        <div className="relative px-4 -mt-8">
          <div className="w-16 h-16 rounded-xl border-4 border-card bg-card overflow-hidden shadow-md">
            {shop.logo_url ? (
              <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xl">
                {shop.name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4 pt-2">
          <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
            {shop.name}
          </h3>
          {shop.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{shop.description}</p>
          )}
          {shop.location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{shop.location}</span>
            </div>
          )}
          <div className="mt-auto pt-3 flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 mt-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {shop.followers_count}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {shop.views_count}
              </span>
            </div>
            {shop.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-gold text-gold" />
                <span className="font-medium">{Number(shop.rating).toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
});
