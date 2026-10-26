import {
  Check,
  Droplets,
  Flame,
  Heart,
  Loader2,
  ShoppingBag,
  Sparkles,
  Star,
} from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import {
  consultarStockProducto,
  type ConsultaStockErpResult,
} from '../services/dolibarrApi';
import type {
  Product,
  ProductColorVariant,
  ProductSize,
  ProductTag,
} from '../types';

interface ProductCardProps {
  product: Product;
}

const FALLBACK_SPORT_IMAGE =
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80';

function getTagStyles(tag: ProductTag) {
  switch (tag) {
    case 'Bestseller':
      return {
        className:
          'border-[#00f2fe]/50 bg-[#0b0f19]/85 text-[#00f2fe] shadow-[0_0_12px_rgba(0,242,254,0.25)]',
        icon: <Flame className="h-3 w-3" />,
      };
    case 'Eco-Dry':
      return {
        className: 'border-emerald-400/40 bg-[#0b0f19]/85 text-emerald-300',
        icon: <Droplets className="h-3 w-3" />,
      };
    case 'Athleisure':
      return {
        className: 'border-sky-400/40 bg-[#0b0f19]/85 text-sky-300',
        icon: <Sparkles className="h-3 w-3" />,
      };
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, getProductCartCount } = useCart();

  const [selectedSize, setSelectedSize] = useState<ProductSize>(
    product.sizes.includes('M') ? 'M' : product.sizes[0]
  );
  const [selectedColor, setSelectedColor] = useState<ProductColorVariant>(
    product.colors[0]
  );
  const [justAdded, setJustAdded] = useState(false);
  const [isCheckingStock, setIsCheckingStock] = useState(false);
  const [erpStockInfo, setErpStockInfo] =
    useState<ConsultaStockErpResult | null>(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.image);
  const [hoverSrc, setHoverSrc] = useState(product.hoverImage);

  const inCartCount = getProductCartCount(product.id);
  const baseStock = erpStockInfo ? erpStockInfo.availableStock : product.stock;
  const remainingStock = Math.max(0, baseStock - inCartCount);
  const isLowStock = remainingStock > 0 && remainingStock <= 6;
  const isOutOfStock = remainingStock === 0;

  const discountPercentage =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100
        )
      : null;

  // Pre-sincroniza stock de mostrador ALM-TIENDA al pasar el cursor
  const handlePrefetchStock = () => {
    if (erpStockInfo || isCheckingStock) return;
    void consultarStockProducto(product.id, product.stock).then((res) => {
      setErpStockInfo(res);
    });
  };

  // Valida disponibilidad en tiempo real en Dolibarr (GET /products/{id}/stock) antes de añadir
  const handleAdd = async () => {
    if (isOutOfStock || isCheckingStock) return;

    setIsCheckingStock(true);
    try {
      const stockCheck = await consultarStockProducto(
        product.id,
        product.stock
      );
      setErpStockInfo(stockCheck);

      const added = addToCart(
        product,
        selectedSize,
        selectedColor,
        1,
        stockCheck.availableStock
      );

      if (added) {
        setJustAdded(true);
        window.setTimeout(() => {
          setJustAdded(false);
        }, 1150);
      }
    } finally {
      setIsCheckingStock(false);
    }
  };

  return (
    <article
      onMouseEnter={handlePrefetchStock}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-[#111827] transition-all duration-300 hover:-translate-y-1.5 ${
        justAdded
          ? 'border-[#00f2fe] shadow-[0_0_32px_rgba(0,242,254,0.28)]'
          : 'border-[#1f2937] hover:border-[#00f2fe]/45 hover:shadow-[0_20px_50px_rgba(0,0,0,0.65)]'
      }`}
    >
      {/* Imagen Principal + Hover Crossfade */}
      <div className="relative aspect-[4/4.3] w-full overflow-hidden bg-[#0b0f19]">
        <img
          src={imgSrc}
          alt={product.name}
          loading="lazy"
          onError={() => setImgSrc(FALLBACK_SPORT_IMAGE)}
          className="h-full w-full object-cover object-center transition-all duration-500 group-hover:scale-105 group-hover:opacity-0"
        />
        <img
          src={hoverSrc}
          alt={`${product.name} vista alternativa`}
          loading="lazy"
          onError={() => setHoverSrc(imgSrc)}
          className="absolute inset-0 h-full w-full object-cover object-center opacity-0 scale-105 transition-all duration-500 group-hover:opacity-100 group-hover:scale-110"
        />

        {/* Gradiente cinemático inferior */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#111827] via-[#111827]/45 to-transparent" />

        {/* Etiquetas Superiores Izquierda */}
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5 max-w-[78%]">
          {product.tags.map((tag) => {
            const style = getTagStyles(tag);
            return (
              <span
                key={tag}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md ${style.className}`}
              >
                {style.icon}
                {tag}
              </span>
            );
          })}
        </div>

        {/* Badge Ahorro & Wishlist Derecha */}
        <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={() => setWishlisted((prev) => !prev)}
            aria-label="Guardar en favoritos"
            className={`flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-md transition cursor-pointer ${
              wishlisted
                ? 'border-rose-500/60 bg-rose-500/20 text-rose-400'
                : 'border-white/15 bg-[#0b0f19]/70 text-slate-300 hover:border-[#00f2fe]/60 hover:text-[#00f2fe]'
            }`}
          >
            <Heart
              className={`h-4 w-4 ${wishlisted ? 'fill-current' : ''}`}
            />
          </button>

          {discountPercentage && (
            <span className="rounded-md bg-[#0284c7] px-2 py-0.5 font-mono text-[11px] font-bold text-white shadow">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Indicador de Stock Sincronizado con ALM-TIENDA */}
        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-[11px]">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-semibold backdrop-blur-md ${
              isOutOfStock
                ? 'border-rose-500/40 bg-rose-950/80 text-rose-300'
                : isLowStock
                  ? 'border-amber-400/40 bg-amber-950/80 text-amber-300'
                  : 'border-white/10 bg-[#0b0f19]/80 text-slate-200'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isOutOfStock
                  ? 'bg-rose-400'
                  : isLowStock
                    ? 'bg-amber-400 animate-ping'
                    : erpStockInfo?.mode === 'live'
                      ? 'bg-[#00f2fe]'
                      : 'bg-emerald-400'
              }`}
            />
            {isOutOfStock
              ? 'Agotado en mostrador'
              : isLowStock
                ? `¡Últimas ${remainingStock} uds!`
                : erpStockInfo?.mode === 'live'
                  ? `ALM-TIENDA: ${remainingStock} disp.`
                  : `Stock: ${remainingStock} disp.`}
          </span>

          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-[#0b0f19]/80 px-2 py-0.5 font-mono text-[11px] font-semibold text-amber-300 backdrop-blur-md">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {product.rating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Cuerpo de Información y Variantes */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <span>{product.brand}</span>
          <span className="font-mono text-[10px] text-slate-500">
            {product.sku}
          </span>
        </div>

        <h3 className="mt-1 font-display text-2xl font-bold uppercase tracking-wide text-white leading-tight group-hover:text-[#00f2fe] transition-colors">
          {product.name}
        </h3>

        <p className="mt-1.5 line-clamp-2 text-xs text-slate-400 leading-relaxed">
          {product.description}
        </p>

        {/* Precio en Bolivianos (BOB) */}
        <div className="mt-3 flex items-baseline gap-2.5">
          <span className="font-mono text-2xl font-extrabold text-white">
            Bs {product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="font-mono text-xs text-slate-500 line-through">
              Bs {product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Selector de Colores */}
        <div className="mt-4 pt-3 border-t border-[#1f2937]">
          <div className="flex items-center justify-between text-[11px] mb-2">
            <span className="font-semibold uppercase tracking-wider text-slate-400">
              Color:{' '}
              <strong className="text-slate-200 font-semibold">
                {selectedColor.name}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {product.colors.map((color) => {
              const isSelected = selectedColor.id === color.id;
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  title={color.name}
                  aria-label={`Seleccionar color ${color.name}`}
                  className={`relative h-7 w-7 rounded-full p-0.5 transition-transform cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-[#00f2fe] ring-offset-2 ring-offset-[#111827] scale-110'
                      : 'opacity-80 hover:opacity-100 hover:scale-105 ring-1 ring-white/20'
                  }`}
                >
                  <span
                    className="block h-full w-full rounded-full border border-white/15"
                    style={{ backgroundColor: color.hex }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Selector Interactivo de Tallas (S, M, L, XL) */}
        <div className="mt-3.5">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-slate-400">
              Talla
            </span>
            <span className="text-[10px] text-slate-500 truncate max-w-[68%]">
              {product.fitLabel}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {product.sizes.map((size) => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-lg py-1.5 font-mono text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'border border-[#00f2fe] bg-[#00f2fe]/15 text-[#00f2fe] shadow-[0_0_12px_rgba(0,242,254,0.22)]'
                      : 'border border-[#1f2937] bg-[#0b0f19] text-slate-300 hover:border-slate-600 hover:text-white'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        {/* Botón Añadir a la Bolsa con Validación ERP en Tiempo Real */}
        <div className="mt-4 pt-1">
          <button
            type="button"
            disabled={isOutOfStock || isCheckingStock}
            onClick={() => {
              void handleAdd();
            }}
            className={`group/btn relative w-full overflow-hidden rounded-xl py-3 px-4 text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              isOutOfStock
                ? 'cursor-not-allowed border border-slate-800 bg-slate-900 text-slate-500'
                : justAdded
                  ? 'bg-emerald-400 text-[#0b0f19] shadow-[0_0_24px_rgba(52,211,153,0.5)] scale-[0.99]'
                  : 'bg-gradient-to-r from-[#00f2fe] to-[#0284c7] text-[#0b0f19] shadow-[0_6px_22px_rgba(0,242,254,0.22)] hover:shadow-[0_8px_28px_rgba(0,242,254,0.42)] hover:brightness-110 active:scale-[0.98]'
            }`}
          >
            {!isOutOfStock && !justAdded && !isCheckingStock && (
              <span className="pointer-events-none absolute inset-0 w-1/3 bg-white/30 blur-md opacity-0 group-hover/btn:opacity-100 group-hover/btn:animate-shimmer" />
            )}

            <span className="relative flex items-center justify-center gap-2">
              {isCheckingStock ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verificando Stock...</span>
                </>
              ) : justAdded ? (
                <>
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>¡En tu Bolsa! ({selectedSize})</span>
                </>
              ) : isOutOfStock ? (
                <span>Sin Stock Disponible</span>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  <span>Añadir a la Bolsa</span>
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
