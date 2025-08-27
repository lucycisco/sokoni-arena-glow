import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import HotDealsSection from '@/components/HotDealsSection';
import CategoriesSection from '@/components/CategoriesSection';
import LatestListingsSection from '@/components/LatestListingsSection';
import AdvertiseSection from '@/components/AdvertiseSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <HotDealsSection />
        <CategoriesSection />
        <LatestListingsSection />
        <AdvertiseSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
