/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  FREE_SHIPPING_THRESHOLD,
  PROMO_COUPON_CODE,
  PROMO_DISCOUNT_RATE,
  STANDARD_SHIPPING_COST,
} from '../data/products';
import type {
  CartItem,
  Product,
  ProductColorVariant,
  ProductSize,
  ToastNotification,
} from '../types';

const CART_STORAGE_KEY = 'sportshark_cart_v1';
const COUPON_STORAGE_KEY = 'sportshark_coupon_v1';
export const WELCOME_SESSION_KEY = 'sportshark_welcome_dismissed_v1';

interface CouponResult {
  success: boolean;
  message: string;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  couponCode: string | null;
  discountAmount: number;
  subtotalAfterDiscount: number;
  shippingCost: number;
  finalTotal: number;
  amountForFreeShipping: number;
  freeShippingProgress: number;
  hasFreeShipping: boolean;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isWelcomeOpen: boolean;
  badgeBounceKey: number;
  toasts: ToastNotification[];
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  openWelcomePopup: () => void;
  dismissWelcomePopup: () => void;
  addToCart: (
    product: Product,
    size: ProductSize,
    color: ProductColorVariant,
    quantity?: number,
    erpAvailableStock?: number
  ) => boolean;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, nextQuantity: number) => void;
  clearCart: () => void;
  applyCoupon: (rawCode: string, silentToast?: boolean) => CouponResult;
  removeCoupon: () => void;
  getProductCartCount: (productId: number) => number;
  pushToast: (toast: Omit<ToastNotification, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function readInitialCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

function readInitialCoupon(): string | null {
  try {
    const saved = localStorage.getItem(COUPON_STORAGE_KEY);
    return saved === PROMO_COUPON_CODE ? saved : null;
  } catch {
    return null;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readInitialCart);
  const [couponCode, setCouponCode] = useState<string | null>(readInitialCoupon);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [badgeBounceKey, setBadgeBounceKey] = useState(0);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Mostrar el pop-up de lanzamiento si no fue cerrado en esta sesión
  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem(WELCOME_SESSION_KEY);
      if (!dismissed) {
        const timer = window.setTimeout(() => {
          setIsWelcomeOpen(true);
        }, 420);
        return () => window.clearTimeout(timer);
      }
    } catch {
      // Ignorar restricciones de sessionStorage en modo privado estricto
    }
    return undefined;
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Sin bloqueo si falla el almacenamiento local
    }
  }, [items]);

  useEffect(() => {
    try {
      if (couponCode) {
        localStorage.setItem(COUPON_STORAGE_KEY, couponCode);
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch {
      // Sin bloqueo
    }
  }, [couponCode]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (toast: Omit<ToastNotification, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-2), { ...toast, id }]);
      window.setTimeout(() => {
        dismissToast(id);
      }, 3600);
    },
    [dismissToast]
  );

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  const openCheckout = useCallback(() => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  }, []);

  const closeCheckout = useCallback(() => {
    setIsCheckoutOpen(false);
  }, []);

  const openWelcomePopup = useCallback(() => {
    setIsWelcomeOpen(true);
  }, []);

  const dismissWelcomePopup = useCallback(() => {
    try {
      sessionStorage.setItem(WELCOME_SESSION_KEY, 'true');
    } catch {
      // Sin bloqueo
    }
    setIsWelcomeOpen(false);
  }, []);

  const getProductCartCount = useCallback(
    (productId: number) =>
      items
        .filter((item) => item.product.id === productId)
        .reduce((acc, item) => acc + item.quantity, 0),
    [items]
  );

  const addToCart = useCallback(
    (
      product: Product,
      selectedSize: ProductSize,
      selectedColor: ProductColorVariant,
      quantity = 1,
      erpAvailableStock?: number
    ): boolean => {
      const effectiveMaxStock =
        typeof erpAvailableStock === 'number'
          ? erpAvailableStock
          : product.stock;

      const currentProductUnits = items
        .filter((item) => item.product.id === product.id)
        .reduce((acc, item) => acc + item.quantity, 0);

      if (currentProductUnits + quantity > effectiveMaxStock) {
        pushToast({
          title: 'Stock insuficiente en ALM-TIENDA',
          message:
            effectiveMaxStock <= 0
              ? `${product.name} se encuentra sin existencias en mostrador.`
              : `Solo quedan ${effectiveMaxStock} unidades disponibles de ${product.name}.`,
          type: 'warning',
          imageUrl: product.image,
        });
        return false;
      }

      const cartItemId = `${product.id}-${selectedSize}-${selectedColor.id}`;

      setItems((prev) => {
        const existingIndex = prev.findIndex((i) => i.cartItemId === cartItemId);
        if (existingIndex >= 0) {
          return prev.map((item, idx) =>
            idx === existingIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [
          ...prev,
          {
            cartItemId,
            product,
            selectedSize,
            selectedColor,
            quantity,
          },
        ];
      });

      setBadgeBounceKey((prev) => prev + 1);

      pushToast({
        title: '¡Añadido a tu Bolsa Shark!',
        message: `${product.name} · Talla ${selectedSize} · ${selectedColor.name}`,
        type: 'success',
        imageUrl: product.image,
      });

      return true;
    },
    [items, pushToast]
  );

  const removeFromCart = useCallback((cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  }, []);

  const updateQuantity = useCallback(
    (cartItemId: string, nextQuantity: number) => {
      if (nextQuantity <= 0) {
        removeFromCart(cartItemId);
        return;
      }

      setItems((prev) => {
        const target = prev.find((item) => item.cartItemId === cartItemId);
        if (!target) return prev;

        const otherVariantsCount = prev
          .filter(
            (item) =>
              item.product.id === target.product.id &&
              item.cartItemId !== cartItemId
          )
          .reduce((acc, item) => acc + item.quantity, 0);

        if (otherVariantsCount + nextQuantity > target.product.stock) {
          pushToast({
            title: 'Límite de stock disponible',
            message: `Stock total disponible para este modelo: ${target.product.stock} uds.`,
            type: 'warning',
            imageUrl: target.product.image,
          });
          return prev;
        }

        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: nextQuantity }
            : item
        );
      });
    },
    [pushToast, removeFromCart]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const applyCoupon = useCallback(
    (rawCode: string, silentToast = false): CouponResult => {
      const normalized = rawCode.trim().toUpperCase();

      if (!normalized) {
        return {
          success: false,
          message: 'Ingresa un código promocional válido.',
        };
      }

      if (normalized !== PROMO_COUPON_CODE) {
        return {
          success: false,
          message: 'Cupón no válido. Usa SHARK15 para tu 15% de descuento.',
        };
      }

      setCouponCode(PROMO_COUPON_CODE);

      if (!silentToast) {
        pushToast({
          title: '¡Cupón SHARK15 Activado!',
          message: 'Tienes 15% OFF aplicado automáticamente en tu bolsa.',
          type: 'info',
        });
      }

      return {
        success: true,
        message: '¡15% de descuento SHARK15 aplicado!',
      };
    },
    [pushToast]
  );

  const removeCoupon = useCallback(() => {
    setCouponCode(null);
  }, []);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      Number(
        items
          .reduce((sum, item) => sum + item.product.price * item.quantity, 0)
          .toFixed(2)
      ),
    [items]
  );

  const discountAmount = useMemo(
    () =>
      couponCode === PROMO_COUPON_CODE
        ? Number((subtotal * PROMO_DISCOUNT_RATE).toFixed(2))
        : 0,
    [couponCode, subtotal]
  );

  const subtotalAfterDiscount = useMemo(
    () => Number(Math.max(0, subtotal - discountAmount).toFixed(2)),
    [subtotal, discountAmount]
  );

  const amountForFreeShipping = useMemo(
    () => Number(Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)),
    [subtotal]
  );

  const freeShippingProgress = useMemo(
    () =>
      Math.min(
        100,
        Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100)
      ),
    [subtotal]
  );

  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  const shippingCost = useMemo(() => {
    if (items.length === 0) return 0;
    return hasFreeShipping ? 0 : STANDARD_SHIPPING_COST;
  }, [hasFreeShipping, items.length]);

  const finalTotal = useMemo(
    () => Number((subtotalAfterDiscount + shippingCost).toFixed(2)),
    [shippingCost, subtotalAfterDiscount]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalItems,
      subtotal,
      couponCode,
      discountAmount,
      subtotalAfterDiscount,
      shippingCost,
      finalTotal,
      amountForFreeShipping,
      freeShippingProgress,
      hasFreeShipping,
      isCartOpen,
      isCheckoutOpen,
      isWelcomeOpen,
      badgeBounceKey,
      toasts,
      openCart,
      closeCart,
      toggleCart,
      openCheckout,
      closeCheckout,
      openWelcomePopup,
      dismissWelcomePopup,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      applyCoupon,
      removeCoupon,
      getProductCartCount,
      pushToast,
      dismissToast,
    }),
    [
      items,
      totalItems,
      subtotal,
      couponCode,
      discountAmount,
      subtotalAfterDiscount,
      shippingCost,
      finalTotal,
      amountForFreeShipping,
      freeShippingProgress,
      hasFreeShipping,
      isCartOpen,
      isCheckoutOpen,
      isWelcomeOpen,
      badgeBounceKey,
      toasts,
      openCart,
      closeCart,
      toggleCart,
      openCheckout,
      closeCheckout,
      openWelcomePopup,
      dismissWelcomePopup,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      applyCoupon,
      removeCoupon,
      getProductCartCount,
      pushToast,
      dismissToast,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart debe utilizarse dentro de un CartProvider');
  }
  return ctx;
}
