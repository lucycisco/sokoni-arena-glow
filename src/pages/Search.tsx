import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Filter, Phone, MessageCircle, Mail, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { allProducts, categories, type Product } from '@/data/mockData';
import { Link, useSearchParams } from 'react-router-dom';
import { useSearch } from '@/hooks/useSearch';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const {
    filters,
    filteredProducts,
    updateFilters,
    clearFilters,
    getUniqueLocations
  } = useSearch(allProducts);

  const locations = useMemo(() => getUniqueLocations(allProducts), []);

  // Set initial search term from URL
  useEffect(() => {
    if (initialQuery) {
      updateFilters({ searchTerm: initialQuery });
    }
  }, [initialQuery, updateFilters]);

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
                <Search className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold gradient-text">Search Results</h1>
              </div>
            </div>
            <Badge className="bg-primary text-primary-foreground">
              {filteredProducts.length} products found
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
              placeholder="Search products, services, or sellers..."
              value={filters.searchTerm}
              onChange={(e) => updateFilters({ searchTerm: e.target.value })}
              className="pl-10 pr-4 py-3 rounded-xl border-2 border-primary/20 focus:border-primary"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select value={filters.category} onValueChange={(value) => updateFilters({ category: value })}>
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

            <Select value={filters.condition} onValueChange={(value) => updateFilters({ condition: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="used">Used</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.location} onValueChange={(value) => updateFilters({ location: value })}>
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

            <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="discount">Highest Discount</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Price Range: KSh {filters.priceRange[0].toLocaleString()} - KSh {filters.priceRange[1].toLocaleString()}
            </label>
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
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
              Showing {filteredProducts.length} of {allProducts.length} products
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
              className={`${product.isHotDeal ? 'hot-deal-glow' : 'product-card'}`}
            >
              <div className={product.isHotDeal ? 'hot-deal-content' : 'product-content'}>
                {/* Product Image */}
                <div className="relative mb-4 overflow-hidden rounded-lg">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                  />
                  {product.isHotDeal && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-primary text-primary-foreground">
                        Hot Deal
                      </Badge>
                    </div>
                  )}
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
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No products found</h3>
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

export default SearchPage;