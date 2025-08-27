import { motion } from 'framer-motion';
import { ArrowRight, Star, Users, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-marketplace.jpg';

const HeroSection = () => {
  const stats = [
    { icon: Users, label: 'Happy Customers', value: '50,000+' },
    { icon: ShoppingBag, label: 'Products Listed', value: '25,000+' },
    { icon: Star, label: 'Verified Sellers', value: '2,500+' },
  ];

  const scrollToHotDeals = () => {
    document.getElementById('hot-deals')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToAdvertise = () => {
    document.getElementById('advertise')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-warm-green/80 to-light-purple/70" />
      </div>

      {/* Animated Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-light-yellow/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Welcome Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white mb-6"
          >
            <Star className="w-4 h-4 mr-2 text-light-yellow" />
            Welcome to Kenya's Most Beautiful Marketplace
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Welcome to{' '}
            <span className="bg-gradient-to-r from-light-yellow to-light-pink bg-clip-text text-transparent">
              Sokoni Arena
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Discover amazing products and services in Kenya's most beautiful online marketplace. 
            From electronics to real estate, fashion to services — find everything you need in one magical place.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Button
              onClick={scrollToHotDeals}
              className="bg-white text-primary hover:bg-light-yellow hover:text-primary font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 hover:scale-105 shadow-glow"
            >
              Shop Hot Deals
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              onClick={scrollToAdvertise}
              className="border-2 border-white text-white hover:bg-white hover:text-primary font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 hover:scale-105"
            >
              Start Selling Today
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white"
              >
                <stat.icon className="w-8 h-8 mb-3 mx-auto text-light-yellow" />
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-white/80">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white rounded-full flex justify-center"
        >
          <div className="w-1 h-3 bg-white rounded-full mt-2" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;