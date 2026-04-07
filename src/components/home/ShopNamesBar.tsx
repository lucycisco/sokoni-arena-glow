import { memo } from "react";
import { Link } from "react-router-dom";
import { Store } from "lucide-react";
import { usePromotedShops } from "@/hooks/useShops";

export const ShopNamesBar = memo(function ShopNamesBar() {
  const { shops, isLoading } = usePromotedShops(16);

  if (isLoading || shops.length === 0) return null;

  return (
    <div className="bg-primary/90 dark:bg-primary/80 py-2.5 overflow-hidden">
      <div className="container">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
          <Store className="h-4 w-4 text-primary-foreground shrink-0" />
          <span className="text-primary-foreground text-xs font-semibold uppercase tracking-wider shrink-0">
            Top Shops
          </span>
          <div className="h-4 w-px bg-primary-foreground/30 shrink-0" />
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {shops.map((shop, i) => (
              <Link
                key={shop.id}
                to={`/shop/${shop.slug}`}
                className="shrink-0 px-3 py-1 rounded-full text-xs font-medium text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/15 transition-colors whitespace-nowrap"
              >
                {shop.name}
                {i < shops.length - 1 && <span className="ml-2 text-primary-foreground/30">•</span>}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
