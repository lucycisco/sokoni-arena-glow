import { motion } from 'framer-motion';
import { Heart, MessageCircle, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', href: '#' },
    { name: 'Hot Deals', href: '#hot-deals' },
    { name: 'Categories', href: '#categories' },
    { name: 'Advertise', href: '#advertise' }
  ];

  const categories = [
    'Electronics', 'Fashion', 'Real Estate', 'Vehicles', 
    'Services', 'Agriculture', 'Home & Garden', 'Sports'
  ];

  const handleWhatsApp = () => {
    window.open('https://wa.me/254712345678?text=Hello Sokoni Arena! I need assistance.', '_blank');
  };

  const handleEmail = () => {
    window.open('mailto:info@sokoniarena.co.ke', '_self');
  };

  const handleCall = () => {
    window.open('tel:+254712345678', '_self');
  };

  return (
    <footer className="bg-gradient-to-br from-primary to-warm-green text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                <h3 className="font-bold text-xl">Sokoni Arena</h3>
                <p className="text-sm text-white/80">Kenya's Beautiful Marketplace</p>
              </div>
            </div>
            <p className="text-white/90 mb-6">
              Discover amazing products and services in Kenya's most beautiful online marketplace. 
              From electronics to real estate, find everything you need in one magical place.
            </p>
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleWhatsApp}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleEmail}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <Mail className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCall}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <Phone className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white/80 hover:text-white transition-colors flex items-center group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">
                      {link.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Popular Categories */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="font-bold text-lg mb-6">Popular Categories</h3>
            <ul className="space-y-3">
              {categories.slice(0, 6).map((category) => (
                <li key={category}>
                  <a
                    href="#categories"
                    className="text-white/80 hover:text-white transition-colors flex items-center group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">
                      {category}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="font-bold text-lg mb-6">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-white/80" />
                <span className="text-white/90">+254 712 345 678</span>
              </div>
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-5 h-5 text-white/80" />
                <span className="text-white/90">WhatsApp Support</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-white/80" />
                <span className="text-white/90">info@sokoniarena.co.ke</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-white/80" />
                <span className="text-white/90">Nairobi, Kenya</span>
              </div>
            </div>

            {/* Call to Action */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="mt-6 bg-white/10 backdrop-blur-sm p-4 rounded-lg"
            >
              <p className="text-sm text-white/90 mb-2">Need Help?</p>
              <button
                onClick={handleWhatsApp}
                className="text-light-yellow font-semibold hover:text-white transition-colors flex items-center"
              >
                Contact us now
                <ExternalLink className="w-4 h-4 ml-1" />
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="border-t border-white/20 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-white/80">
                © {currentYear} Sokoni Arena. All rights reserved.
              </p>
            </div>

            {/* Made by */}
            <div className="flex items-center space-x-2 text-white/80">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-400 fill-current" />
              <span>by</span>
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="font-bold text-light-yellow hover:text-white transition-colors cursor-pointer"
              >
                The Matrix Nexus CoreTech
              </motion.span>
            </div>

            {/* Additional Links */}
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-white/80 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-light-yellow via-light-pink to-light-purple" />
    </footer>
  );
};

export default Footer;