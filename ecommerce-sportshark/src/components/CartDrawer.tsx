import {
  ArrowRight,
  CheckCircle2,
  Minus,
  Plus,
  QrCode,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useCart } from '../context/CartContext';
import { PROMO_COUPON_CODE } from '../data/products';

export function CartDrawer() {
  const {
    items,
    totalItems,
    subtotal,
    couponCode,
    discountAmount,
    shippingCost,
    finalTotal,
    amountForFreeShipping,
    freeShippingProgress,
    hasFreeShipping,
    isCartOpen,
    closeCart,
    openCheckout,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!isCartOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeCart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (event: FormEvent) => {
    event.preventDefault();
    const result = applyCoupon(couponInput);
    setCouponFeedback({ ok: result.success, text: result.message });
    if (result.success) {
      setCouponInput('');
    }
  };

  const handleQuickApplyShark15 = () => {
    const result = applyCoupon(PROMO_COUPON_CODE);
    setCouponFeedback({ ok: result.success, text: result.message });
    setCouponInput('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#050811]/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Bolsa de compras Sport Shark"
      onClick={closeCart}
    >
      <aside
        className="relative flex h-full w-full max-w-md flex-col border-l border-[#1f2937] bg-[#111827] shadow-[0_0_60px_rgba(0,0,0,0.85)] animate-drawer-slide"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Drawer */}
        <div className="flex items-center justify-between border-b border-[#1f2937] bg-[#0b0f19]/90 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#00f2fe]/35 bg-[#00f2fe]/10 text-[#00f2fe]">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-extrabold uppercase italic tracking-wide text-white leading-none">
                Tu Bolsa Shark
              </h2>
              <span className="text-[11px] text-slate-400">
                {totalItems}{' '}
                {totalItems === 1 ? 'prenda seleccionada' : 'prendas seleccionadas'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#111827] text-slate-300 transition hover:border-[#00f2fe] hover:text-[#00f2fe] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Barra de Progreso Interactiva para Envío Gratis */}
        <div className="border-b border-[#1f2937] bg-[#0b0f19]/60 px-5 py-3.5">
          <div className="flex items-center justify-between gap-2 text-xs mb-2">
            {hasFreeShipping ? (
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                ¡Desbloqueaste ENVÍO GRATIS a toda Bolivia!
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-slate-200">
                <Truck className="h-4 w-4 shrink-0 text-[#00f2fe]" />
                <span>
                  ¡Agrega{' '}
                  <strong className="font-mono font-extrabold text-[#00f2fe]">
                    Bs{' '}
                    {Number.isInteger(amountForFreeShipping)
                      ? amountForFreeShipping
                      : amountForFreeShipping.toFixed(2)}
                  </strong>{' '}
                  más para envío gratis!
                </span>
              </span>
            )}
            <span className="font-mono text-[11px] font-bold text-slate-400">
              {freeShippingProgress}%
            </span>
          </div>

          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[#1f2937]">
            <div
              className={`relative h-full rounded-full transition-all duration-500 ${
                hasFreeShipping
                  ? 'bg-gradient-to-r from-emerald-400 via-[#00f2fe] to-emerald-400'
                  : 'bg-gradient-to-r from-[#0284c7] to-[#00f2fe]'
              }`}
              style={{ width: `${freeShippingProgress}%` }}
            >
              <span className="pointer-events-none absolute inset-0 w-1/2 bg-white/35 blur-xs animate-shimmer" />
            </div>
          </div>
        </div>

        {/* Lista de Ítems o Estado Vacío */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-[#1f2937] bg-[#0b0f19] text-slate-500 mb-4">
                <ShoppingBag className="h-9 w-9 text-[#00f2fe]/60" />
              </div>
              <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                Tu bolsa está vacía
              </h3>
              <p className="mt-1.5 max-w-xs text-xs text-slate-400 leading-relaxed">
                Equípate con nuestras poleras Dri-FIT, joggers y calzado de alto
                impacto. Recuerda usar{' '}
                <strong className="font-mono text-[#00f2fe]">
                  {PROMO_COUPON_CODE}
                </strong>{' '}
                para obtener 15% OFF.
              </p>

              {!couponCode && (
                <button
                  type="button"
                  onClick={handleQuickApplyShark15}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-[#00f2fe]/40 bg-[#00f2fe]/10 px-4 py-2 text-xs font-bold text-[#00f2fe] transition hover:bg-[#00f2fe]/20 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Dejar activado {PROMO_COUPON_CODE} (-15%)
                </button>
              )}

              <button
                type="button"
                onClick={closeCart}
                className="mt-5 rounded-xl bg-gradient-to-r from-[#00f2fe] to-[#0284c7] px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-[#0b0f19] shadow-[0_0_20px_rgba(0,242,254,0.3)] transition hover:brightness-110 cursor-pointer"
              >
                Explorar Catálogo
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.cartItemId}
                className="flex gap-3.5 rounded-2xl border border-[#1f2937] bg-[#0b0f19]/85 p-3 transition hover:border-slate-700"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="h-24 w-20 shrink-0 rounded-xl object-cover bg-[#111827]"
                />

                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-display text-lg font-bold uppercase tracking-wide text-white leading-tight truncate">
                        {item.product.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.cartItemId)}
                        aria-label={`Eliminar ${item.product.name}`}
                        className="rounded-lg p-1 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span className="rounded bg-[#111827] border border-[#1f2937] px-1.5 py-0.5 font-mono font-bold text-[#00f2fe]">
                        Talla {item.selectedSize}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span
                          className="h-2.5 w-2.5 rounded-full border border-white/20"
                          style={{ backgroundColor: item.selectedColor.hex }}
                        />
                        {item.selectedColor.name}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    {/* Control de cantidad */}
                    <div className="inline-flex items-center rounded-lg border border-[#1f2937] bg-[#111827]">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.cartItemId, item.quantity - 1)
                        }
                        aria-label="Disminuir cantidad"
                        className="flex h-7 w-7 items-center justify-center text-slate-300 transition hover:text-[#00f2fe] cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-7 text-center font-mono text-xs font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.cartItemId, item.quantity + 1)
                        }
                        aria-label="Aumentar cantidad"
                        className="flex h-7 w-7 items-center justify-center text-slate-300 transition hover:text-[#00f2fe] cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="block font-mono text-sm font-extrabold text-white">
                        Bs {(item.product.price * item.quantity).toFixed(2)}
                      </span>
                      {item.quantity > 1 && (
                        <span className="block font-mono text-[10px] text-slate-500">
                          Bs {item.product.price.toFixed(0)} c/u
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pie del Carrito: Cupón SHARK15 + Totales + Checkout */}
        {items.length > 0 && (
          <div className="border-t border-[#1f2937] bg-[#0b0f19] p-5 space-y-4">
            {/* Gestor de Cupón Promocional */}
            <div>
              {couponCode ? (
                <div className="flex items-center justify-between rounded-xl border border-emerald-400/35 bg-emerald-500/10 px-3.5 py-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-emerald-400" />
                    <div>
                      <span className="font-mono font-bold text-emerald-300">
                        {couponCode}
                      </span>
                      <span className="ml-1.5 text-slate-300">
                        (-15% aplicado)
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      removeCoupon();
                      setCouponFeedback(null);
                    }}
                    className="text-[11px] font-semibold text-slate-400 hover:text-rose-400 cursor-pointer"
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) =>
                          setCouponInput(e.target.value.toUpperCase())
                        }
                        placeholder="Código de cupón (ej. SHARK15)"
                        className="w-full rounded-xl border border-[#1f2937] bg-[#111827] py-2 pl-8 pr-3 font-mono text-xs uppercase text-white placeholder-slate-500 outline-none focus:border-[#00f2fe]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="rounded-xl border border-[#00f2fe]/50 bg-[#00f2fe]/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#00f2fe] transition hover:bg-[#00f2fe] hover:text-[#0b0f19] cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </form>

                  <div className="flex items-center justify-between text-[11px]">
                    <button
                      type="button"
                      onClick={handleQuickApplyShark15}
                      className="inline-flex items-center gap-1 text-[#00f2fe] hover:underline cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3" />
                      Aplicar cupón inaugural {PROMO_COUPON_CODE} (-15%)
                    </button>
                    {couponFeedback && !couponFeedback.ok && (
                      <span className="text-rose-400">
                        {couponFeedback.text}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Desglose Financiero BOB */}
            <div className="space-y-1.5 text-xs border-t border-[#1f2937] pt-3">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal mercadería</span>
                <span className="font-mono">Bs {subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Descuento {couponCode} (15%)</span>
                  <span className="font-mono">
                    -Bs {discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-slate-300">
                <span>Envío nacional / Cochabamba</span>
                <span className="font-mono">
                  {shippingCost === 0 ? (
                    <strong className="text-[#00f2fe]">GRATIS</strong>
                  ) : (
                    `Bs ${shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="flex items-baseline justify-between border-t border-[#1f2937] pt-2.5 text-base font-extrabold text-white">
                <span>Total a Pagar</span>
                <div className="text-right">
                  <span className="font-mono text-xl text-[#00f2fe]">
                    Bs {finalTotal.toFixed(2)}
                  </span>
                  <span className="block text-[10px] font-normal text-slate-400">
                    Incluye Factura Electrónica IVA 13%
                  </span>
                </div>
              </div>
            </div>

            {/* Botón Checkout Pasarela Simple QR */}
            <button
              type="button"
              onClick={openCheckout}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#00f2fe] via-[#38bdf8] to-[#0284c7] py-3.5 px-5 text-sm font-extrabold uppercase tracking-wider text-[#0b0f19] shadow-[0_0_26px_rgba(0,242,254,0.35)] transition hover:brightness-110 active:scale-[0.99] cursor-pointer"
            >
              <span className="pointer-events-none absolute inset-0 w-1/2 bg-white/30 blur-md animate-shimmer" />
              <span className="relative flex items-center justify-center gap-2">
                <QrCode className="h-4 w-4" />
                Pagar con Simple QR
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
