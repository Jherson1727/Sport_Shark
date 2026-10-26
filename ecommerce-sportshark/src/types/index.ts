export type ProductCategory =
  | 'Poleras'
  | 'Shorts'
  | 'Calzado'
  | 'Buzos'
  | 'Accesorios';

export type FilterCategory = 'Todos' | ProductCategory;

export type ProductSize = 'S' | 'M' | 'L' | 'XL';

export type ProductTag = 'Bestseller' | 'Athleisure' | 'Eco-Dry';

export interface ProductColorVariant {
  id: string;
  name: string;
  hex: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  hoverImage: string;
  stock: number;
  sizes: ProductSize[];
  colors: ProductColorVariant[];
  tags: ProductTag[];
  rating: number;
  reviewsCount: number;
  fitLabel: string;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  selectedSize: ProductSize;
  selectedColor: ProductColorVariant;
  quantity: number;
}

export type BolivianCity =
  | 'Cochabamba'
  | 'La Paz'
  | 'Santa Cruz'
  | 'El Alto'
  | 'Sucre'
  | 'Tarija'
  | 'Oruro'
  | 'Potosí'
  | 'Trinidad'
  | 'Cobija';

export interface CustomerCheckoutData {
  fullName: string;
  whatsapp: string;
  city: BolivianCity;
  address: string;
  nitOrCi: string;
  email?: string;
}

export type ErpSyncMode = 'live' | 'offline-fallback';

export interface DolibarrSyncSummary {
  mode: ErpSyncMode;
  thirdpartyId: number;
  customerCode: string;
  invoiceId: number;
  invoiceRef: string;
  paymentId: number;
  warehouseCode: string;
  warehouseId: number;
  bankCode: string;
  bankAccountId: number;
}

export interface OrderReceipt {
  orderRef: string;
  createdAt: string;
  customer: CustomerCheckoutData;
  items: CartItem[];
  subtotal: number;
  couponCode: string | null;
  discountAmount: number;
  shippingCost: number;
  totalBob: number;
  taxIvaBob: number;
  paymentMethod: string;
  qrAuthCode: string;
  erpSync?: DolibarrSyncSummary;
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning';
  imageUrl?: string;
}
