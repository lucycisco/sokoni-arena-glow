import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Filter, Flame, Phone, MessageCircle, Mail, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { hotDeals, categories, type Product } from '@/data/mockData';
import { Link } from 'react-router-dom';

const HotDeals = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [sortBy, setSortBy] = useState('newest');

  // Get unique locations from hot deals
  const locations = useMemo(() => {
    const uniqueLocations = [...new Set(hotDeals.map(product => product.location))];
    return uniqueLocations;
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = hotDeals.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.seller.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesCondition = selectedCondition === 'all' || product.condition === selectedCondition;
      const matchesLocation = selectedLocation === 'all' || product.location === selectedLocation;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesCondition && matchesLocation && matchesPrice;
    });

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        break;
      case 'discount':
        filtered.sort((a, b) => {
          const aDiscount = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) : 0;
          const bDiscount = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) : 0;
          return bDiscount - aDiscount;
        });
        break;
      default:
        break;
    }

    return filtered;
  }, [searchTerm, selectedCategory, selectedCondition, selectedLocation, priceRange, sortBy]);

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleWhatsApp = (phone: string, productTitle: string) => {
    const message = `Hi! I'm interested in your hot deal: ${productTitle}`;
    window.open(`https://wa.me/${phone.replace('+', '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleEmail = (email: string, productTitle: string) => {
    const subject = `Inquiry about hot deal: ${productTitle}`;
    const body = `Hi,\n\nI'm interested in your hot deal: ${productTitle}\n\nPlease provide more details.\n\nThanks!`;
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedCondition('all');
    setSelectedLocation('all');
    setPriceRange([0, 2000000]);
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <div className="sticky top-0 z-50 glass-effect border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Flame className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold gradient-text">Hot Deals</h1>
              </div>
            </div>
            <Badge className="bg-primary text-primary-foreground">
              {filteredProducts.length} deals found
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search hot deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 rounded-xl border-2 border-primary/20 focus:border-primary"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCondition} onValueChange={setSelectedCondition}>
              <SelectTrigger>
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="used">Used</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="discount">Highest Discount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Price Range: KSh {priceRange[0].toLocaleString()} - KSh {priceRange[1].toLocaleString()}</label>
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={2000000}
              min={0}
              step={1000}
              className="w-full"
            />
          </div>

          {/* Clear Filters */}
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={clearFilters}>
              Clear All Filters
            </Button>
            <span className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} of {hotDeals.length} hot deals
            </span>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
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
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-primary">
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
                  <div className="flex items-center space-x-2 p-2 bg-secondary/30 rounded-lg">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-xs">
                        {product.seller.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-1">
                        <span className="font-medium text-xs">{product.seller.name}</span>
                        {product.seller.verified && (
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Buttons */}
                  <div className="grid grid-cols-3 gap-1">
                    <Button
                      onClick={() => handleCall(product.seller.phone)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Phone className="w-3 h-3" />
                    </Button>
                    <Button
                      onClick={() => handleWhatsApp(product.seller.whatsapp, product.title)}
                      variant="outline"
                      size="sm"
                      className="w-full bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                    >
                      <MessageCircle className="w-3 h-3" />
                    </Button>
                    <Button
                      onClick={() => handleEmail(product.seller.email, product.title)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Mail className="w-3 h-3" />
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

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Flame className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No hot deals found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or clearing the filters
            </p>
            <Button onClick={clearFilters} className="btn-hero">
              Clear All Filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HotDeals;