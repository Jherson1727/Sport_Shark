import {
  QrCode,
  Search,
  ShoppingBag,
  Sparkles,
  Truck,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useCart } from '../context/CartContext';
import { CATEGORIES, PROMO_COUPON_CODE } from '../data/products';
import type { FilterCategory } from '../types';

interface NavbarProps {
  selectedCategory: FilterCategory;
  onSelectCategory: (category: FilterCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Navbar({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}: NavbarProps) {
  const {
    totalItems,
    finalTotal,
    couponCode,
    badgeBounceKey,
    openCart,
    openWelcomePopup,
  } = useCart();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 18);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Atajo de teclado "/" para enfocar el buscador en vivo
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isInput =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT';

      if (event.key === '/' && !isInput) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleCategoryClick = (category: FilterCategory) => {
    onSelectCategory(category);
    const catalogEl = document.getElementById('catalogo-productos');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Barra superior de anuncios estratégicos */}
      <div className="border-b border-[#00f2fe]/15 bg-gradient-to-r from-[#082f49] via-[#0b0f19] to-[#082f49] px-3 py-2 text-[11px] sm:text-xs font-medium text-slate-200">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <div className="mx-auto lg:mx-0 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
            <span className="inline-flex items-center gap-1.5 text-slate-100">
              <Truck className="h-3.5 w-3.5 text-[#00f2fe]" />
              Envíos a toda Bolivia
            </span>
            <span className="text-slate-600">|</span>
            <span className="inline-flex items-center gap-1.5 text-slate-100">
              <Zap className="h-3.5 w-3.5 text-[#00f2fe]" />
              Entregas el mismo día en Cochabamba
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-slate-100">
              <QrCode className="h-3.5 w-3.5 text-[#00f2fe]" />
              Pago Simple QR Interoperable
            </span>
          </div>

          <button
            type="button"
            onClick={openWelcomePopup}
            className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-[#00f2fe]/40 bg-[#00f2fe]/10 px-3 py-0.5 text-[11px] font-bold tracking-wider text-[#00f2fe] transition hover:bg-[#00f2fe]/20 cursor-pointer"
          >
            <Sparkles className="h-3 w-3" />
            {couponCode === PROMO_COUPON_CODE
              ? `CUPÓN ${PROMO_COUPON_CODE} ACTIVO (-15%)`
              : `USA ${PROMO_COUPON_CODE}: 15% OFF`}
          </button>
        </div>
      </div>

      {/* Navbar Flotante Glassmorphism */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 pt-2.5 pb-2">
        <nav
          aria-label="Navegación principal Sport Shark"
          className={`rounded-2xl border transition-all duration-300 backdrop-blur-xl ${
            isScrolled
              ? 'border-[#00f2fe]/25 bg-[#0b0f19]/88 shadow-[0_14px_45px_rgba(0,0,0,0.72)] py-2.5 px-4'
              : 'border-white/10 bg-[#111827]/78 shadow-[0_10px_30px_rgba(0,0,0,0.45)] py-3 px-4 sm:px-5'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            {/* Logo Oficial Sport Shark S.R.L. */}
            <button
              type="button"
              onClick={() => {
                onSelectCategory('Todos');
                onSearchChange('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group flex items-center gap-3 text-left focus:outline-none cursor-pointer shrink-0"
            >
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[#0b0f19]/90 border border-[#00f2fe]/25 p-1 transition group-hover:border-[#00f2fe]/70 group-hover:shadow-[0_0_18px_rgba(0,242,254,0.3)]">
                <img
                  src="/logo.png"
                  alt="Sport Shark Logo"
                  className="h-full w-full object-contain drop-shadow-[0_0_8px_rgba(0,242,254,0.4)]"
                />
              </div>
              <div className="hidden sm:block">
                <span className="block font-display text-2xl font-black uppercase italic tracking-wider leading-none text-white group-hover:text-[#00f2fe] transition">
                  SPORT SHARK
                </span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Cochabamba · Bolivia
                </span>
              </div>
            </button>

            {/* Selector de Categorías Desktop */}
            <div className="hidden xl:flex items-center gap-1 rounded-xl border border-white/5 bg-[#0b0f19]/75 p-1">
              {CATEGORIES.map((category) => {
                const isActive = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryClick(category)}
                    className={`relative rounded-lg px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#00f2fe] to-[#0284c7] text-[#0b0f19] shadow-[0_0_16px_rgba(0,242,254,0.35)]'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            {/* Buscador en Vivo + Acciones Derecha */}
            <div className="flex items-center gap-2.5 flex-1 xl:flex-initial justify-end">
              {/* Buscador Desktop/Tablet */}
              <div className="relative hidden md:block w-full max-w-xs lg:w-64">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Buscar poleras, zapatillas, SKU..."
                  aria-label="Buscar productos"
                  className="w-full rounded-xl border border-[#1f2937] bg-[#0b0f19]/90 py-2 pl-9 pr-14 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition focus:border-[#00f2fe] focus:ring-2 focus:ring-[#00f2fe]/20"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    aria-label="Limpiar búsqueda"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-slate-700 bg-[#111827] px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                    /
                  </kbd>
                )}
              </div>

              {/* Botón Lupa Móvil */}
              <button
                type="button"
                onClick={() => setMobileSearchOpen((prev) => !prev)}
                aria-label="Abrir buscador"
                className="flex md:hidden h-10 w-10 items-center justify-center rounded-xl border border-[#1f2937] bg-[#0b0f19]/80 text-slate-200 transition hover:border-[#00f2fe]/50 hover:text-[#00f2fe] cursor-pointer"
              >
                {mobileSearchOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </button>

              {/* Botón Carrito con Badge Dinámico */}
              <button
                type="button"
                onClick={openCart}
                aria-label="Abrir bolsa de compras"
                className="group relative flex items-center gap-2.5 rounded-xl border border-[#00f2fe]/35 bg-gradient-to-r from-[#0b0f19] to-[#111827] px-3.5 py-2 text-sm font-bold text-white transition hover:border-[#00f2fe] hover:shadow-[0_0_22px_rgba(0,242,254,0.28)] cursor-pointer"
              >
                <div className="relative">
                  <ShoppingBag className="h-5 w-5 text-[#00f2fe] transition-transform group-hover:scale-110" />
                  <span
                    key={badgeBounceKey}
                    className={`absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full px-1 font-mono text-[11px] font-extrabold ${
                      totalItems > 0
                        ? 'bg-[#00f2fe] text-[#0b0f19] shadow-[0_0_12px_rgba(0,242,254,0.8)] animate-badge-pop'
                        : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {totalItems}
                  </span>
                </div>

                <div className="hidden sm:flex flex-col items-start leading-tight pl-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">
                    Mi Bolsa
                  </span>
                  <span className="font-mono text-xs font-bold text-white">
                    Bs {finalTotal.toFixed(0)}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Buscador Desplegable en Móvil */}
          {mobileSearchOpen && (
            <div className="mt-3 md:hidden">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Buscar poleras, shorts, calzado..."
                  autoFocus
                  className="w-full rounded-xl border border-[#00f2fe]/40 bg-[#0b0f19] py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Barra Horizontal de Categorías para Tablet/Móvil */}
          <div className="mt-2.5 flex xl:hidden items-center gap-1.5 overflow-x-auto pb-1">
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryClick(category)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00f2fe] to-[#0284c7] text-[#0b0f19] shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                      : 'border border-white/10 bg-[#0b0f19]/70 text-slate-300 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
