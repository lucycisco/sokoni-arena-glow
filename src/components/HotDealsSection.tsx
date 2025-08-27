import { motion } from 'framer-motion';
import { Flame, Clock, Star, Phone, MessageCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { hotDeals } from '@/data/mockData';

const HotDealsSection = () => {
  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleWhatsApp = (phone: string, productTitle: string) => {
    const message = `Hi! I'm interested in your product: ${productTitle}`;
    window.open(`https://wa.me/${phone.replace('+', '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleEmail = (email: string, productTitle: string) => {
    const subject = `Inquiry about: ${productTitle}`;
    const body = `Hi,\n\nI'm interested in your product: ${productTitle}\n\nPlease provide more details.\n\nThanks!`;
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
  };

  return (
    <section id="hot-deals" className="py-20 bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-6 py-3 bg-gradient-hot-deal rounded-full mb-6">
            <Flame className="w-6 h-6 mr-2 text-primary" />
            <span className="font-bold text-primary">Hot Deals</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            Premium Featured Products
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover exclusive deals from verified sellers. Limited time offers with amazing savings!
          </p>
        </motion.div>

        {/* Hot Deals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {hotDeals.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ y: 100, opacity: 0, scale: 0.9 }}
              whileInView={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="hot-deal-glow"
            >
              <div className="hot-deal-content">
                {/* Product Image */}
                <div className="relative mb-4 overflow-hidden rounded-lg">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-primary text-primary-foreground">
                      <Flame className="w-3 h-3 mr-1" />
                      Hot Deal
                    </Badge>
                  </div>
                  {product.originalPrice && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
                      Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-primary">
                      KSh {product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        KSh {product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Location & Condition */}
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{product.location}</span>
                    <Badge variant="outline" className="capitalize">
                      {product.condition}
                    </Badge>
                  </div>

                  {/* Seller Info */}
                  <div className="flex items-center space-x-2 p-3 bg-secondary/30 rounded-lg">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm">
                        {product.seller.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-1">
                        <span className="font-medium text-sm">{product.seller.name}</span>
                        {product.seller.verified && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">Verified Seller</span>
                    </div>
                  </div>

                  {/* Contact Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => handleCall(product.seller.phone)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleWhatsApp(product.seller.whatsapp, product.title)}
                      variant="outline"
                      size="sm"
                      className="w-full bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleEmail(product.seller.email, product.title)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Time Indicator */}
                  <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Limited time offer</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Hot Deals Button */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a href="/hot-deals">
            <Button className="btn-hero px-8 py-4 text-lg">
              View All Hot Deals
              <Flame className="ml-2 w-5 h-5" />
            </Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HotDealsSection;