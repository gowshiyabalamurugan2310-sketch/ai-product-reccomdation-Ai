import { Product, UserProfile } from './types';

export const products: Product[] = [
  {
    id: 'p1',
    name: 'Ultra-Quiet Mechanical Keyboard',
    category: 'Electronics',
    price: 129.99,
    description: 'A premium mechanical keyboard with silent switches, perfect for late-night coding sessions.',
    imageUrl: 'https://picsum.photos/seed/keyboard/400/300',
    tags: ['mechanical', 'keyboard', 'silent', 'rgb', 'gaming'],
    stock: 45
  },
  {
    id: 'p2',
    name: 'Ergonomic Standing Desk',
    category: 'Furniture',
    price: 499.00,
    description: 'Adjustable height desk with memory presets and a spacious bamboo surface.',
    imageUrl: 'https://picsum.photos/seed/desk/400/300',
    tags: ['ergonomic', 'desk', 'office', 'standing'],
    stock: 12
  },
  {
    id: 'p3',
    name: 'Noise-Cancelling Wireless Headphones',
    category: 'Electronics',
    price: 349.99,
    description: 'Industry-leading noise cancellation with 30-hour battery life and superior sound quality.',
    imageUrl: 'https://picsum.photos/seed/headphones/400/300',
    tags: ['headphones', 'wireless', 'anc', 'audio'],
    stock: 89
  },
  {
    id: 'p4',
    name: 'Organic Cotton Hoodie',
    category: 'Apparel',
    price: 65.00,
    description: 'Soft, sustainable, and stylish. Made from 100% organic cotton.',
    imageUrl: 'https://picsum.photos/seed/hoodie/400/300',
    tags: ['clothing', 'organic', 'cotton', 'hoodie'],
    stock: 120
  },
  {
    id: 'p5',
    name: 'Smart Water Bottle',
    category: 'Health',
    price: 45.00,
    description: 'Tracks your hydration and glows to remind you to drink water.',
    imageUrl: 'https://picsum.photos/seed/bottle/400/300',
    tags: ['health', 'smart', 'water', 'bottle'],
    stock: 200
  },
  {
    id: 'p6',
    name: '4K Ultra HD Monitor',
    category: 'Electronics',
    price: 599.99,
    description: '27-inch 4K monitor with HDR support and color accuracy for professionals.',
    imageUrl: 'https://picsum.photos/seed/monitor/400/300',
    tags: ['monitor', '4k', 'display', 'professional'],
    stock: 25
  },
  {
    id: 'p7',
    name: 'Minimalist Leather Wallet',
    category: 'Accessories',
    price: 40.00,
    description: 'Slim design with RFID blocking technology and premium full-grain leather.',
    imageUrl: 'https://picsum.photos/seed/wallet/400/300',
    tags: ['wallet', 'leather', 'minimalist', 'accessories'],
    stock: 150
  },
  {
    id: 'p8',
    name: 'Portable Power Bank 20000mAh',
    category: 'Electronics',
    price: 55.00,
    description: 'High-capacity power bank with fast charging for multiple devices.',
    imageUrl: 'https://picsum.photos/seed/powerbank/400/300',
    tags: ['powerbank', 'battery', 'portable', 'charging'],
    stock: 300
  }
];

export const mockUser: UserProfile = {
  id: 'u123',
  name: 'Alex Johnson',
  age: 28,
  gender: 'Non-binary',
  location: 'San Francisco, CA',
  incomeLevel: 'high',
  purchaseHistory: ['p1', 'p8'],
  browsingHistory: [
    { productId: 'p3', dwellTime: 120, clicks: 3, timestamp: new Date().toISOString() },
    { productId: 'p6', dwellTime: 45, clicks: 1, timestamp: new Date().toISOString() }
  ],
  searchQueries: ['best noise cancelling headphones', '4k monitor for coding'],
  cart: ['p3']
};
