export interface User {
  id: string;
  phone: string;
  email?: string;
  role: 'CUSTOMER' | 'MERCHANT' | 'ADMIN' | 'SUPER_ADMIN';
  status: string;
  language: 'FR' | 'WO' | 'EN';
}

export interface Shop {
  id: string;
  name: string;
  slug: string;
  type: string;
  description?: string;
  shortDescription?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  publicAddress?: string;
  status: string;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  isPublic: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  price: number | string;
  promotionalPrice?: number | string;
  stock: number;
  status: string;
  availability: string;
  shopId: string;
  categoryId?: string;
  seoTitle?: string;
  seoDescription?: string;
  customFields?: Record<string, any>;
  image?: string;
  leadTime?: string;
  createdAt: string;
  updatedAt: string;
  shop?: Shop;
  category?: Category;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  shopId: string;
  status: string;
  paymentStatus: string;
  subtotal: number | string;
  discount: number | string;
  tax: number | string;
  deliveryFee: number | string;
  total: number | string;
  currency: string;
  paymentMethod?: string;
  createdAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginDto {
  phone: string;
}

export interface VerifyOtpDto {
  phone: string;
  code: string;
}

export interface RegisterDto {
  phone: string;
  email?: string;
  role?: 'customer' | 'merchant';
}
