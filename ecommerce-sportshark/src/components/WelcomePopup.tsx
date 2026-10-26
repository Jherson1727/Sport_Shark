import {
  Check,
  Copy,
  Flame,
  Mail,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useCart } from '../context/CartContext';
import { PROMO_COUPON_CODE } from '../data/products';

export function WelcomePopup() {
  const { isWelcomeOpen, dismissWelcomePopup, applyCoupon, pushToast } =
    useCart();
  const [subscriberContact, setSubscriberContact] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isWelcomeOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        dismissWelcomePopup();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWelcomeOpen, dismissWelcomePopup]);

  if (!isWelcomeOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(PROMO_COUPON_CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleClaimDiscount = (event: FormEvent) => {
    event.preventDefault();
    applyCoupon(PROMO_COUPON_CODE, true);

    try {
      void navigator.clipboard.writeText(PROMO_COUPON_CODE);
    } catch {
      // Sin bloqueo si el navegador restringe portapapeles
    }

    pushToast({
      title: '¡Bienvenido al Shark Pack! (-15% Activo)',
      message: subscriberContact.trim()
        ? `Registramos ${subscriberContact.trim()} y activamos ${PROMO_COUPON_CODE} en tu bolsa.`
        : `El cupón ${PROMO_COUPON_CODE} (15% OFF) ya está activo en tu carrito.`,
      type: 'success',
    });

    dismissWelcomePopup();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#050811]/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-pack-title"
      onClick={dismissWelcomePopup}
    >
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-[#00f2fe]/30 bg-[#111827] shadow-[0_25px_90px_rgba(0,242,254,0.18)] animate-modal-reveal grid grid-cols-1 md:grid-cols-12"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar superior */}
        <button
          type="button"
          onClick={dismissWelcomePopup}
          aria-label="Cerrar anuncio de bienvenida"
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#0b0f19]/80 text-slate-300 backdrop-blur-md transition hover:border-[#00f2fe] hover:text-[#00f2fe] cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Columna Visual Cinemática */}
        <div className="relative hidden md:flex md:col-span-5 flex-col justify-between overflow-hidden bg-[#0b0f19] p-7">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=80"
            alt="Entrenamiento de alto impacto Sport Shark"
            className="absolute inset-0 h-full w-full object-cover opacity-45 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/65 to-[#0284c7]/25" />

          <div className="relative z-10 flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Sport Shark S.R.L."
              className="h-14 w-auto drop-shadow-[0_0_14px_rgba(0,242,254,0.45)] animate-float"
            />
          </div>

          <div className="relative z-10 space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#00f2fe]/40 bg-[#00f2fe]/10 px-3 py-1 text-[11px] font-bold tracking-widest uppercase text-[#00f2fe]">
              <Flame className="h-3.5 w-3.5" /> Drop Inaugural 2026
            </span>
            <p className="font-display text-3xl font-extrabold uppercase italic leading-none tracking-wide text-white">
              ENTRENA SIN GRAVEDAD. DOMINA LA CIUDAD.
            </p>
            <p className="text-xs text-slate-300/90 leading-relaxed">
              Indumentaria técnica &amp; athleisure diseñada para la nueva
              generación de atletas en Cochabamba y toda Bolivia.
            </p>
          </div>
        </div>

        {/* Columna Interactiva y Cupón */}
        <div className="relative col-span-1 md:col-span-7 p-6 sm:p-8 md:p-9 flex flex-col justify-center bg-shark-grid">
          <div className="pointer-events-none absolute -top-24 -right-24 h-52 w-52 rounded-full bg-[#00f2fe]/15 blur-3xl" />

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#00f2fe] mb-2">
            <Sparkles className="h-4 w-4" />
            <span>Promoción Exclusiva de Apertura</span>
          </div>

          <h2
            id="welcome-pack-title"
            className="font-display text-4xl sm:text-5xl font-black uppercase italic tracking-tight leading-[0.95] text-white"
          >
            WELCOME TO THE{' '}
            <span className="bg-gradient-to-r from-[#00f2fe] to-[#0284c7] bg-clip-text text-transparent">
              SHARK PACK
            </span>
          </h2>

          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            Desbloquea un{' '}
            <span className="font-bold text-white">
              15% DE DESCUENTO directo
            </span>{' '}
            en tu primera orden online y recibe acceso anticipado a nuestros
            drops limitados en Bolivia.
          </p>

          {/* Ticket interactivo del cupón SHARK15 */}
          <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-[#00f2fe]/50 bg-[#0b0f19]/90 px-4 py-3.5 shadow-inner">
            <div>
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Código Oficial Apertura
              </span>
              <span className="font-mono text-2xl font-bold tracking-widest text-[#00f2fe]">
                {PROMO_COUPON_CODE}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#1f2937] bg-[#111827] px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-[#00f2fe]/60 hover:text-[#00f2fe] cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copiar cupón</span>
                </>
              )}
            </button>
          </div>

          {/* Formulario rápido de suscripción / reclamo inmediato */}
          <form onSubmit={handleClaimDiscount} className="mt-5 space-y-3">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={subscriberContact}
                onChange={(e) => setSubscriberContact(e.target.value)}
                placeholder="Tu correo o WhatsApp (+591) — opcional para VIP Drops"
                className="w-full rounded-xl border border-[#1f2937] bg-[#0b0f19] py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-[#00f2fe] focus:ring-2 focus:ring-[#00f2fe]/20"
              />
            </div>

            <button
              type="submit"
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#00f2fe] via-[#38bdf8] to-[#0284c7] py-3.5 px-6 text-sm font-extrabold uppercase tracking-wider text-[#0b0f19] shadow-[0_0_25px_rgba(0,242,254,0.35)] transition hover:brightness-110 active:scale-[0.99] cursor-pointer"
            >
              <span className="pointer-events-none absolute inset-0 w-1/2 bg-white/30 blur-md animate-shimmer" />
              <span className="relative flex items-center justify-center gap-2">
                <Zap className="h-4 w-4 fill-current" />
                Reclamar 15% de Descuento Ahora
              </span>
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>Válido para envíos en los 9 departamentos</span>
            <button
              type="button"
              onClick={dismissWelcomePopup}
              className="font-medium text-slate-400 underline decoration-slate-600 underline-offset-4 transition hover:text-white cursor-pointer"
            >
              Explorar tienda ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
