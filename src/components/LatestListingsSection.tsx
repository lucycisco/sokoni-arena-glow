import { motion } from 'framer-motion';
import { Clock, MapPin, Star, Phone, MessageCircle, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { latestListings } from '@/data/mockData';

const LatestListingsSection = () => {
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
    <section className="py-20 bg-gradient-to-br from-background to-accent/10">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-6 py-3 bg-accent/20 rounded-full mb-6">
            <Clock className="w-5 h-5 mr-2 text-primary" />
            <span className="font-bold text-primary">Latest Listings</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            Fresh Products & Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Just added to our marketplace! Discover the newest products and services from sellers across Kenya
          </p>
        </motion.div>

        {/* Latest Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {latestListings.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ y: 100, opacity: 0, scale: 0.9 }}
              whileInView={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="product-card group"
            >
              {/* Product Image */}
              <div className="relative mb-4 overflow-hidden rounded-xl">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    <Clock className="w-3 h-3 mr-1" />
                    New
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge variant="outline" className="capitalize bg-background/80">
                    {product.condition}
                  </Badge>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                </div>

                {/* Price */}
                <div className="text-2xl font-bold text-primary">
                  KSh {product.price.toLocaleString()}
                </div>

                {/* Location */}
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{product.location}</span>
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
                    <span className="text-xs text-muted-foreground">
                      {product.seller.verified ? 'Verified Seller' : 'New Seller'}
                    </span>
                  </div>
                </div>

                {/* Contact Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => handleCall(product.seller.phone)}
                    variant="outline"
                    size="sm"
                    className="w-full hover:bg-primary hover:text-primary-foreground"
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
                    className="w-full hover:bg-primary hover:text-primary-foreground"
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>

                {/* Date Added */}
                <div className="text-xs text-muted-foreground text-center">
                  Added {new Date(product.dateAdded).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Listings Button */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button className="btn-hero px-8 py-4 text-lg">
            View All Latest Products
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default LatestListingsSection;