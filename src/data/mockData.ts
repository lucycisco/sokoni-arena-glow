// Mock data for Sokoni Arena

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  condition: 'new' | 'used';
  category: string;
  subcategory: string;
  location: string;
  images: string[];
  seller: {
    name: string;
    phone: string;
    whatsapp: string;
    email: string;
    verified: boolean;
  };
  isHotDeal: boolean;
  featured: boolean;
  dateAdded: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories: string[];
  productCount: number;
}

export const categories: Category[] = [
  {
    id: 'electronics',
    name: 'Electronics',
    icon: 'Smartphone',
    subcategories: ['Mobile Phones', 'Laptops', 'TVs', 'Audio', 'Gaming', 'Accessories'],
    productCount: 1247
  },
  {
    id: 'fashion',
    name: 'Fashion & Beauty',
    icon: 'Shirt',
    subcategories: ['Men\'s Fashion', 'Women\'s Fashion', 'Shoes', 'Bags', 'Beauty Products', 'Jewelry'],
    productCount: 2156
  },
  {
    id: 'home',
    name: 'Home & Garden',
    icon: 'Home',
    subcategories: ['Furniture', 'Appliances', 'Kitchenware', 'Garden', 'Decor', 'Tools'],
    productCount: 876
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    icon: 'Car',
    subcategories: ['Cars', 'Motorbikes', 'Bicycles', 'Spare Parts', 'Trucks', 'Boats'],
    productCount: 543
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    icon: 'Building',
    subcategories: ['Houses for Sale', 'Rental Properties', 'Land', 'Commercial', 'Vacation Rentals'],
    productCount: 432
  },
  {
    id: 'services',
    name: 'Services',
    icon: 'Briefcase',
    subcategories: ['Freelancing', 'Education', 'Health', 'Events', 'Repair Services', 'Consulting'],
    productCount: 987
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    icon: 'Wheat',
    subcategories: ['Crops', 'Livestock', 'Equipment', 'Seeds', 'Fertilizers', 'Farm Land'],
    productCount: 321
  },
  {
    id: 'sports',
    name: 'Sports & Hobbies',
    icon: 'Dumbbell',
    subcategories: ['Fitness', 'Team Sports', 'Outdoor', 'Hobbies', 'Gaming', 'Musical Instruments'],
    productCount: 654
  }
];

export const hotDeals: Product[] = [
  {
    id: 'hd1',
    title: 'iPhone 15 Pro Max - Like New',
    description: 'Barely used iPhone 15 Pro Max, 256GB, Natural Titanium. Comes with original box, charger, and screen protector.',
    price: 185000,
    originalPrice: 220000,
    condition: 'new',
    category: 'electronics',
    subcategory: 'Mobile Phones',
    location: 'Nairobi, Kenya',
    images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500'],
    seller: {
      name: 'John Kimani',
      phone: '+254712345678',
      whatsapp: '+254712345678',
      email: 'john.kimani@email.com',
      verified: true
    },
    isHotDeal: true,
    featured: true,
    dateAdded: '2024-08-25'
  },
  {
    id: 'hd2',
    title: '3 Bedroom Apartment - Kilimani',
    description: 'Modern 3-bedroom apartment in Kilimani, fully furnished with parking. Great view and amenities.',
    price: 75000,
    condition: 'new',
    category: 'real-estate',
    subcategory: 'Rental Properties',
    location: 'Kilimani, Nairobi',
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500'],
    seller: {
      name: 'Grace Wanjiku',
      phone: '+254723456789',
      whatsapp: '+254723456789',
      email: 'grace.w@email.com',
      verified: true
    },
    isHotDeal: true,
    featured: true,
    dateAdded: '2024-08-24'
  },
  {
    id: 'hd3',
    title: 'Toyota Vitz 2019 - Excellent Condition',
    description: 'Well-maintained Toyota Vitz, low mileage, service records available. Perfect for city driving.',
    price: 1450000,
    originalPrice: 1600000,
    condition: 'used',
    category: 'vehicles',
    subcategory: 'Cars',
    location: 'Mombasa, Kenya',
    images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500'],
    seller: {
      name: 'Peter Ochieng',
      phone: '+254734567890',
      whatsapp: '+254734567890',
      email: 'peter.o@email.com',
      verified: true
    },
    isHotDeal: true,
    featured: true,
    dateAdded: '2024-08-23'
  }
];

export const latestListings: Product[] = [
  {
    id: 'll1',
    title: 'Samsung 65" Smart TV',
    description: 'Brand new Samsung 65-inch Smart TV with HDR support and built-in apps.',
    price: 95000,
    condition: 'new',
    category: 'electronics',
    subcategory: 'TVs',
    location: 'Nakuru, Kenya',
    images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500'],
    seller: {
      name: 'Mary Nyawira',
      phone: '+254745678901',
      whatsapp: '+254745678901',
      email: 'mary.n@email.com',
      verified: false
    },
    isHotDeal: false,
    featured: false,
    dateAdded: '2024-08-26'
  },
  {
    id: 'll2',
    title: 'MacBook Air M2 - 2023',
    description: 'Apple MacBook Air with M2 chip, 8GB RAM, 256GB SSD. Perfect for students and professionals.',
    price: 145000,
    condition: 'new',
    category: 'electronics',
    subcategory: 'Laptops',
    location: 'Kisumu, Kenya',
    images: ['https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500'],
    seller: {
      name: 'David Mutua',
      phone: '+254756789012',
      whatsapp: '+254756789012',
      email: 'david.m@email.com',
      verified: true
    },
    isHotDeal: false,
    featured: false,
    dateAdded: '2024-08-26'
  },
  {
    id: 'll3',
    title: 'Designer Handbag Collection',
    description: 'Authentic designer handbags in various styles and colors. Perfect for fashion enthusiasts.',
    price: 15000,
    condition: 'new',
    category: 'fashion',
    subcategory: 'Bags',
    location: 'Westlands, Nairobi',
    images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500'],
    seller: {
      name: 'Linda Akinyi',
      phone: '+254767890123',
      whatsapp: '+254767890123',
      email: 'linda.a@email.com',
      verified: true
    },
    isHotDeal: false,
    featured: false,
    dateAdded: '2024-08-26'
  },
  {
    id: 'll4',
    title: 'Modern Office Desk Set',
    description: 'Complete office furniture set including desk, chair, and storage units. Perfect for home office.',
    price: 45000,
    condition: 'new',
    category: 'home',
    subcategory: 'Furniture',
    location: 'Eldoret, Kenya',
    images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500'],
    seller: {
      name: 'Samuel Kiprotich',
      phone: '+254778901234',
      whatsapp: '+254778901234',
      email: 'samuel.k@email.com',
      verified: true
    },
    isHotDeal: false,
    featured: false,
    dateAdded: '2024-08-25'
  }
];

export const allProducts = [...hotDeals, ...latestListings];