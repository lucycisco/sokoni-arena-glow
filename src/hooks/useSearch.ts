import { useState, useMemo } from 'react';
import { Product } from '@/data/mockData';

interface SearchFilters {
  searchTerm: string;
  category: string;
  condition: string;
  location: string;
  priceRange: [number, number];
  sortBy: string;
}

export const useSearch = (products: Product[]) => {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    category: 'all',
    condition: 'all',
    location: 'all',
    priceRange: [0, 2000000],
    sortBy: 'newest'
  });

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = 
        product.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        product.seller.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        product.subcategory.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesCategory = filters.category === 'all' || product.category === filters.category;
      const matchesCondition = filters.condition === 'all' || product.condition === filters.condition;
      const matchesLocation = filters.location === 'all' || product.location.includes(filters.location);
      const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];

      return matchesSearch && matchesCategory && matchesCondition && matchesLocation && matchesPrice;
    });

    // Sort products
    switch (filters.sortBy) {
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
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return filtered;
  }, [products, filters]);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      category: 'all',
      condition: 'all',
      location: 'all',
      priceRange: [0, 2000000],
      sortBy: 'newest'
    });
  };

  const getUniqueLocations = (products: Product[]) => {
    return [...new Set(products.map(product => {
      // Extract city from location string
      return product.location.split(',')[0].trim();
    }))];
  };

  return {
    filters,
    filteredProducts,
    updateFilters,
    clearFilters,
    getUniqueLocations
  };
};