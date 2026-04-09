export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string;
  tags: string[];
  stock: number;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  location: string;
  incomeLevel: 'low' | 'medium' | 'high';
  purchaseHistory: string[]; // Product IDs
  browsingHistory: {
    productId: string;
    dwellTime: number; // seconds
    clicks: number;
    timestamp: string;
  }[];
  searchQueries: string[];
  cart: string[]; // Product IDs
}

export interface Recommendation {
  productId: string;
  confidenceScore: number;
  explanation: string;
  crossSellSuggestions: string[]; // Product IDs
  priceOptimization: {
    originalPrice: number;
    optimizedPrice: number;
    discountLikelihood: number; // 0-1
    reason: string;
  };
}

export interface RecommendationResponse {
  recommendations: Recommendation[];
  segment: string;
}
