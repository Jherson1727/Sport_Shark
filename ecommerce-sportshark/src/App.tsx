import {
  ArrowDownRight,
  Award,
  CheckCircle2,
  Droplets,
  Flame,
  MapPin,
  Phone,
  QrCode,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Truck,
  X,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { WelcomePopup } from './components/WelcomePopup';
import { CartProvider, useCart } from './context/CartContext';
import {
  CATEGORIES,
  COMPANY_INFO,
  FREE_SHIPPING_THRESHOLD,
  PRODUCTS,
  PROMO_COUPON_CODE,
} from './data/products';
import type { FilterCategory, ProductTag } from './types';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating';
type TagFilter = 'Todos' | ProductTag;

const TAG_FILTERS: TagFilter[] = [
  'Todos',
  'Bestseller',
  'Athleisure',
  'Eco-Dry',
];

function ToastViewport() {
  const { toasts, dismissToast, openCart } = useCart();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2.5 pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-[#00f2fe]/40 bg-[#111827]/95 p-3.5 shadow-[0_16px_45px_rgba(0,0,0,0.75)] backdrop-blur-xl animate-toast-enter"
        >
          {toast.imageUrl ? (
            <img
              src={toast.imageUrl}
              alt=""
              className="h-12 w-12 shrink-0 rounded-xl object-cover border border-white/10"
            />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00f2fe]/15 text-[#00f2fe]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#00f2fe]">
              {toast.title}
            </p>
            <p className="mt-0.5 truncate text-xs text-slate-200">
              {toast.message}
            </p>
            {toast.type === 'success' && toast.imageUrl && (
              <button
                type="button"
                onClick={() => {
                  dismissToast(toast.id);
                  openCart();
                }}
                className="mt-1 text-[11px] font-bold text-sky-300 underline underline-offset-2 hover:text-white cursor-pointer"
              >
                Ver mi bolsa →
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            aria-label="Cerrar notificación"
            className="rounded-lg p-1 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function StoreExperience() {
  const { couponCode, applyCoupon, openWelcomePopup } = useCart();

  const [selectedCategory, setSelectedCategory] =
    useState<FilterCategory>('Todos');
  const [selectedTag, setSelectedTag] = useState<TagFilter>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = PRODUCTS.filter((product) => {
      const matchesCategory =
        selectedCategory === 'Todos' || product.category === selectedCategory;

      const matchesTag =
        selectedTag === 'Todos' || product.tags.includes(selectedTag);

      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.tags.some((t) => t.toLowerCase().includes(query));

      return matchesCategory && matchesTag && matchesSearch;
    });

    const sorted = [...filtered];
    if (sortBy === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      sorted.sort((a, b) => b.rating - a.rating);
    }

    return sorted;
  }, [selectedCategory, selectedTag, searchQuery, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('Todos');
    setSelectedTag('Todos');
    setSearchQuery('');
    setSortBy('featured');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100">
      <WelcomePopup />
      <Navbar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* HERO CINEMATOGRÁFICO ESTILO ANTIGRAVITY */}
      <section className="relative overflow-hidden border-b border-[#1f2937] bg-shark-grid pt-6 pb-14 sm:pt-10 sm:pb-20">
        {/* Luces volumétricas cian/azul */}
        <div className="pointer-events-none absolute -left-28 top-6 h-80 w-80 rounded-full bg-[#00f2fe]/12 blur-[110px]" />
        <div className="pointer-events-none absolute right-0 bottom-0 h-96 w-96 rounded-full bg-[#0284c7]/18 blur-[130px]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10">
            {/* Narrativa Principal */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[#00f2fe]/35 bg-[#111827]/90 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#00f2fe]">
                <Flame className="h-3.5 w-3.5" />
                <span>Nueva Colección 2026 · Cochabamba, Bolivia</span>
              </div>

              <h1 className="font-display text-5xl sm:text-6xl xl:text-7xl font-black uppercase italic tracking-tight leading-[0.92] text-white">
                ENTRENA SIN GRAVEDAD.{' '}
                <span className="bg-gradient-to-r from-[#00f2fe] via-sky-300 to-[#0284c7] bg-clip-text text-transparent">
                  DOMINA LA CALLE Y EL GYM.
                </span>
              </h1>

              <p className="max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed">
                Ingeniería textil <strong className="text-white">Eco-Dry</strong>,
                cortes atléticos de alto impacto y siluetas{' '}
                <strong className="text-white">Athleisure</strong> creadas para
                quienes nunca bajan el ritmo. Envío gratis desde{' '}
                <span className="font-mono font-bold text-[#00f2fe]">
                  Bs {FREE_SHIPPING_THRESHOLD}
                </span>{' '}
                y cobro instantáneo con Simple QR.
              </p>

              {/* Acciones Hero */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <a
                  href="#catalogo-productos"
                  className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-[#00f2fe] via-[#38bdf8] to-[#0284c7] px-7 py-4 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#0b0f19] shadow-[0_0_30px_rgba(0,242,254,0.35)] transition hover:brightness-110"
                >
                  <span className="pointer-events-none absolute inset-0 w-1/2 bg-white/30 blur-md animate-shimmer" />
                  <span className="relative">Explorar Drop Oficial</span>
                  <ArrowDownRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    if (couponCode === PROMO_COUPON_CODE) {
                      openWelcomePopup();
                    } else {
                      applyCoupon(PROMO_COUPON_CODE);
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#00f2fe]/40 bg-[#111827]/90 px-5 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-white transition hover:border-[#00f2fe] hover:bg-[#00f2fe]/10 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-[#00f2fe]" />
                  {couponCode === PROMO_COUPON_CODE
                    ? `Cupón ${PROMO_COUPON_CODE} Activo (-15%)`
                    : `Activar 15% OFF · ${PROMO_COUPON_CODE}`}
                </button>
              </div>

              {/* Métricas rápidas de confianza */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#1f2937]/80 max-w-xl">
                <div>
                  <span className="block font-display text-2xl sm:text-3xl font-black italic text-white">
                    SAME-DAY
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Entregas hoy en Cochabamba
                  </span>
                </div>
                <div>
                  <span className="block font-display text-2xl sm:text-3xl font-black italic text-[#00f2fe]">
                    SIMPLE QR
                  </span>
                  <span className="text-[11px] text-slate-400">
                    BCP, Unión y todos los bancos
                  </span>
                </div>
                <div>
                  <span className="block font-display text-2xl sm:text-3xl font-black italic text-white">
                    9 DEPTOS.
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Cobertura nacional asegurada
                  </span>
                </div>
              </div>
            </div>

            {/* Showcase Visual Flotante Antigravity */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-3xl border border-[#00f2fe]/30 bg-[#111827] p-3 shadow-[0_25px_80px_rgba(0,0,0,0.75)] animate-float">
                <div className="relative aspect-[4/4.6] overflow-hidden rounded-2xl bg-[#0b0f19]">
                  <img
                    src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=900&q=80"
                    alt="Atleta Sport Shark Bolivia"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-transparent to-[#0b0f19]/30" />

                  {/* Pill superior telemetría */}
                  <div className="absolute left-3.5 top-3.5 flex items-center gap-2 rounded-full border border-white/15 bg-[#0b0f19]/80 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-md">
                    <span className="h-2 w-2 rounded-full bg-[#00f2fe] animate-ping" />
                    SHARK PACK · TEMPORADA 2026
                  </div>

                  {/* Tarjeta superpuesta inferior */}
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 rounded-2xl border border-white/10 bg-[#0b0f19]/85 p-3.5 backdrop-blur-md">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#00f2fe]">
                          Tecnología Textil Activa
                        </span>
                        <p className="font-display text-xl font-extrabold uppercase tracking-wide text-white">
                          Fibra Eco-Dry &amp; 4-Way Stretch
                        </p>
                      </div>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00f2fe]/15 text-[#00f2fe] border border-[#00f2fe]/30">
                        <Droplets className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATÁLOGO MAESTRO DE PRODUCTOS */}
      <main
        id="catalogo-productos"
        className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-12 sm:py-16 scroll-mt-24"
      >
        {/* Cabecera y Filtros del Catálogo */}
        <div className="flex flex-col gap-5 border-b border-[#1f2937] pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#00f2fe]">
                Equipamiento Oficial Sport Shark
              </span>
              <h2 className="mt-1 font-display text-4xl sm:text-5xl font-black uppercase italic tracking-wide text-white leading-none">
                {selectedCategory === 'Todos'
                  ? 'Catálogo de Alto Rendimiento'
                  : `Colección · ${selectedCategory}`}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs text-slate-400">
                Mostrando{' '}
                <strong className="text-white">{filteredProducts.length}</strong>{' '}
                de {PRODUCTS.length} productos
              </span>

              <div className="flex items-center gap-2 rounded-xl border border-[#1f2937] bg-[#111827] px-3 py-2">
                <SlidersHorizontal className="h-3.5 w-3.5 text-[#00f2fe]" />
                <select
                  aria-label="Ordenar productos"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent text-xs font-semibold text-slate-200 outline-none cursor-pointer"
                >
                  <option value="featured" className="bg-[#111827]">
                    Destacados Shark
                  </option>
                  <option value="price-asc" className="bg-[#111827]">
                    Precio: Menor a Mayor
                  </option>
                  <option value="price-desc" className="bg-[#111827]">
                    Precio: Mayor a Menor
                  </option>
                  <option value="rating" className="bg-[#111827]">
                    Mejor Valorados
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Pills de Etiquetas Técnicas y Categorías Rápidas */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {TAG_FILTERS.map((tag) => {
                const active = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                      active
                        ? 'border border-[#00f2fe] bg-[#00f2fe]/15 text-[#00f2fe] shadow-[0_0_14px_rgba(0,242,254,0.2)]'
                        : 'border border-[#1f2937] bg-[#111827] text-slate-400 hover:border-slate-600 hover:text-white'
                    }`}
                  >
                    {tag === 'Todos' ? 'Todas las Líneas' : `#${tag}`}
                  </button>
                );
              })}
            </div>

            {(selectedCategory !== 'Todos' ||
              selectedTag !== 'Todos' ||
              searchQuery.trim() !== '') && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-[#00f2fe] cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Grilla de Productos o Estado Sin Resultados */}
        {filteredProducts.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-[#1f2937] bg-[#111827]/70 px-6 py-16 text-center">
            <p className="font-display text-3xl font-bold uppercase tracking-wide text-white">
              No encontramos prendas con ese criterio
            </p>
            <p className="mt-2 max-w-md text-xs sm:text-sm text-slate-400">
              Prueba buscando otro término (ej. Dri-FIT, Jogger, Puma, Adidas) o
              restablece los filtros activos.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 rounded-xl bg-gradient-to-r from-[#00f2fe] to-[#0284c7] px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-[#0b0f19] cursor-pointer"
            >
              Ver los 10 productos
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      {/* BLOQUE DE BENEFICIOS OPERATIVOS EN BOLIVIA */}
      <section className="border-t border-[#1f2937] bg-[#111827]/60 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="rounded-2xl border border-[#1f2937] bg-[#0b0f19]/90 p-5">
            <Zap className="h-6 w-6 text-[#00f2fe] mb-3" />
            <h3 className="font-display text-xl font-bold uppercase text-white">
              Entrega Express CBBA
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Despachos en el día en toda el área metropolitana de Cochabamba
              para órdenes confirmadas antes de las 17:00.
            </p>
          </div>

          <div className="rounded-2xl border border-[#1f2937] bg-[#0b0f19]/90 p-5">
            <Truck className="h-6 w-6 text-[#00f2fe] mb-3" />
            <h3 className="font-display text-xl font-bold uppercase text-white">
              Envíos a toda Bolivia
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Llegamos en 24–48 hrs a Santa Cruz, La Paz, Sucre, Tarija, Oruro,
              Potosí, Beni y Pando. ¡Gratis desde Bs {FREE_SHIPPING_THRESHOLD}!
            </p>
          </div>

          <div className="rounded-2xl border border-[#1f2937] bg-[#0b0f19]/90 p-5">
            <QrCode className="h-6 w-6 text-[#00f2fe] mb-3" />
            <h3 className="font-display text-xl font-bold uppercase text-white">
              Simple QR Interoperable
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Paga sin comisiones desde cualquier banca móvil boliviana o
              billetera digital con comprobante electrónico al instante.
            </p>
          </div>

          <div className="rounded-2xl border border-[#1f2937] bg-[#0b0f19]/90 p-5">
            <Award className="h-6 w-6 text-[#00f2fe] mb-3" />
            <h3 className="font-display text-xl font-bold uppercase text-white">
              Cambio de Talla Garantizado
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              ¿Necesitas otra talla? Primer cambio gratuito en nuestra tienda de
              Recoleta o mediante courier coordinado.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER CORPORATIVO SPORT SHARK S.R.L. */}
      <footer className="border-t border-[#1f2937] bg-[#0b0f19] py-10 text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Sport Shark S.R.L."
                className="h-11 w-11 object-contain"
              />
              <div>
                <span className="block font-display text-2xl font-black uppercase italic text-white leading-none">
                  SPORT SHARK S.R.L.
                </span>
                <span className="font-mono text-[11px] text-[#00f2fe]">
                  NIT: {COMPANY_INFO.nit}
                </span>
              </div>
            </div>
            <p className="max-w-sm leading-relaxed">
              Tienda líder de indumentaria deportiva de alto impacto y cultura
              athleisure para jóvenes atletas en Bolivia.
            </p>
            <div className="space-y-1 text-slate-300">
              <p className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#00f2fe]" />
                {COMPANY_INFO.address} — {COMPANY_INFO.city}
              </p>
              <p className="block">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-[#00f2fe]" />
                  {COMPANY_INFO.phone} · {COMPANY_INFO.email}
                </span>
              </p>
            </div>
          </div>

          <div className="md:col-span-4 space-y-2.5">
            <h4 className="font-display text-lg font-bold uppercase tracking-wider text-white">
              Categorías
            </h4>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    document
                      .getElementById('catalogo-productos')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="rounded-lg border border-[#1f2937] bg-[#111827] px-3 py-1.5 text-slate-300 transition hover:border-[#00f2fe]/50 hover:text-[#00f2fe] cursor-pointer"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="font-display text-lg font-bold uppercase tracking-wider text-white">
              Beneficio Shark Pack
            </h4>
            <p className="leading-relaxed">
              ¿Aún no usaste tu descuento de lanzamiento? Activa{' '}
              <strong className="font-mono text-[#00f2fe]">
                {PROMO_COUPON_CODE}
              </strong>{' '}
              y ahorra 15% en toda la tienda.
            </p>
            <button
              type="button"
              onClick={openWelcomePopup}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#00f2fe]/40 bg-[#00f2fe]/10 px-4 py-2 font-bold text-[#00f2fe] transition hover:bg-[#00f2fe]/20 cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4" />
              Ver Cupón de Apertura
            </button>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-7xl border-t border-[#1f2937] px-4 sm:px-6 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <span>
            © 2026 {COMPANY_INFO.legalName} Todos los derechos reservados.
          </span>
          <span>
            Integrado con ERP Comercial · Facturación BOB &amp; Simple QR Bolivia
          </span>
        </div>
      </footer>

      <CartDrawer />
      <CheckoutModal />
      <ToastViewport />
    </div>
  );
}

export function App() {
  return (
    <CartProvider>
      <StoreExperience />
    </CartProvider>
  );
}

export default App;
