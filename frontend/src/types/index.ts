export interface User {
  id: string;
  phone: string;
  email?: string;
  role: 'CUSTOMER' | 'MERCHANT' | 'ADMIN' | 'SUPER_ADMIN';
  status: string;
  language: 'FR' | 'WO' | 'EN';
}

export interface OpeningHours {
  [day: string]: { open: string; close: string } | { closed: true } | Array<{ open: string; close: string }> | undefined;
}

export interface Shop {
  id: string;
  name: string;
  slug: string;
  type: 'RETAIL' | 'RESTAURANT' | 'SERVICE' | 'ARTISAN' | string;
  description?: string;
  shortDescription?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  publicAddress?: string;
  seoTitle?: string;
  seoDescription?: string;
  status: string;
  verificationStatus?: 'pending' | 'verified' | 'rejected' | string;
  openingHours?: OpeningHours;
  deliveryZones?: Array<{ id: string; name: string; fee?: number }>;
  settings?: Record<string, unknown>;
  latitude?: string | number;
  longitude?: string | number;
  createdAt: string;
  categories?: Category[];
  products?: Product[];
  subscription?: { status: string; nextDueAt?: string } | null;
  _count?: { products?: number; reviews?: number; orders?: number };
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
  trackInventory?: boolean;
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
  variants?: Array<{ id: string; name: string; price: number | string; stock: number }>;
  media?: Array<{ id: string; url: string; alt?: string }>;
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
  deliveryFeeStatus?: 'confirmed' | 'to_confirm' | string;
  deliveryAddress?: Record<string, string>;
  customerNote?: string;
  createdAt: string;
  shop?: Pick<Shop, 'id' | 'name' | 'slug'>;
  items?: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number | string;
    totalPrice: number | string;
  }>;
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
