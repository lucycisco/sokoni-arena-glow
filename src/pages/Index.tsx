import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { CategorySection } from "@/components/home/CategorySection";
import { ShopNamesBar } from "@/components/home/ShopNamesBar";
import { FeaturedListings } from "@/components/home/FeaturedListings";
import { PremiumShops } from "@/components/home/PremiumShops";
import { FeaturedShops } from "@/components/home/FeaturedShops";
import { TrustSection } from "@/components/home/TrustSection";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <CategorySection />
      <ShopNamesBar />
      <PremiumShops />
      <FeaturedListings />
      <FeaturedShops />
      <TrustSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
