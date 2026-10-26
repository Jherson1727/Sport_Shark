import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  Database,
  Download,
  FileCheck2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Printer,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  User,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useCart } from '../context/CartContext';
import {
  BOLIVIAN_CITIES,
  COMPANY_INFO,
  PROMO_COUPON_CODE,
  PROMO_DISCOUNT_RATE,
} from '../data/products';
import { procesarCheckoutDolibarr } from '../services/dolibarrApi';
import type {
  BolivianCity,
  CustomerCheckoutData,
  OrderReceipt,
} from '../types';

type CheckoutStep = 'form' | 'qr' | 'confirmed';

const QR_DURATION_SECONDS = 300; // 5:00 minutos

function generateOrderRef(): string {
  const randomFour = Math.floor(1000 + Math.random() * 9000);
  return `ORD-WEB-${randomFour}`;
}

function generateAuthCode(): string {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `ACH-BO-${digits}`;
}

/**
 * Construye una matriz QR determinista de 25x25 con patrones de posición reales
 * (esquinas 7x7), líneas de sincronización y módulos derivados de la orden.
 */
function buildSimpleQrMatrix(seed: string): boolean[][] {
  const size = 25;
  const matrix: boolean[][] = Array.from({ length: size }, () =>
    Array<boolean>(size).fill(false)
  );
  const reserved: boolean[][] = Array.from({ length: size }, () =>
    Array<boolean>(size).fill(false)
  );

  const placeFinder = (startR: number, startC: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = startR + r;
        const cc = startC + c;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
        reserved[rr][cc] = true;
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        const inBounds = r >= 0 && r <= 6 && c >= 0 && c <= 6;
        matrix[rr][cc] = inBounds && (isBorder || isInner);
      }
    }
  };

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // Patrón de alineación 5x5 inferior derecho
  for (let r = 16; r <= 20; r++) {
    for (let c = 16; c <= 20; c++) {
      reserved[r][c] = true;
      const border = r === 16 || r === 20 || c === 16 || c === 20;
      const center = r === 18 && c === 18;
      matrix[r][c] = border || center;
    }
  }

  // Líneas de sincronización
  for (let i = 8; i < size - 8; i++) {
    reserved[6][i] = true;
    reserved[i][6] = true;
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Área central limpia para insignia QR Bolivia
  for (let r = 10; r <= 14; r++) {
    for (let c = 10; c <= 14; c++) {
      reserved[r][c] = true;
      matrix[r][c] = false;
    }
  }

  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (reserved[r][c]) continue;
      hash ^= (r * 31 + c * 17) & 0xff;
      hash = Math.imul(hash, 16777619);
      matrix[r][c] = (hash >>> 3) % 10 < 5;
    }
  }

  return matrix;
}

function formatCountdown(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function launchSharkConfetti() {
  const palette = ['#00f2fe', '#0284c7', '#38bdf8', '#ffffff', '#34d399'];

  void confetti({
    particleCount: 85,
    spread: 72,
    origin: { y: 0.6 },
    colors: palette,
  });

  window.setTimeout(() => {
    void confetti({
      particleCount: 55,
      angle: 60,
      spread: 55,
      origin: { x: 0.1, y: 0.65 },
      colors: palette,
    });
    void confetti({
      particleCount: 55,
      angle: 120,
      spread: 55,
      origin: { x: 0.9, y: 0.65 },
      colors: palette,
    });
  }, 240);
}

function downloadDigitalReceiptPng(receipt: OrderReceipt) {
  const canvas = document.createElement('canvas');
  const scale = 2;
  const width = 680;
  const baseHeight = 670 + receipt.items.length * 46;
  canvas.width = width * scale;
  canvas.height = baseHeight * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.scale(scale, scale);

  ctx.fillStyle = '#0b0f19';
  ctx.fillRect(0, 0, width, baseHeight);

  const headerGrad = ctx.createLinearGradient(0, 0, width, 0);
  headerGrad.addColorStop(0, '#00f2fe');
  headerGrad.addColorStop(1, '#0284c7');
  ctx.fillStyle = headerGrad;
  ctx.fillRect(0, 0, width, 8);

  ctx.fillStyle = '#111827';
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(28, 28, width - 56, baseHeight - 56, 20);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#00f2fe';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.fillText('SPORT SHARK S.R.L.', 56, 76);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText(
    `NIT: ${COMPANY_INFO.nit} · ${COMPANY_INFO.address} (${COMPANY_INFO.city})`,
    56,
    98
  );
  ctx.fillText(
    'COMPROBANTE OFICIAL DE PAGO ELECTRÓNICO — SIMPLE QR + DOLIBARR ERP',
    56,
    116
  );

  ctx.fillStyle = '#082f49';
  ctx.beginPath();
  ctx.roundRect(width - 235, 52, 179, 54, 12);
  ctx.fill();
  ctx.strokeStyle = '#00f2fe';
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('REFERENCIA DE ORDEN', width - 220, 72);
  ctx.fillStyle = '#00f2fe';
  ctx.font = 'bold 18px monospace';
  ctx.fillText(receipt.orderRef, width - 220, 95);

  ctx.strokeStyle = '#1f2937';
  ctx.beginPath();
  ctx.moveTo(56, 136);
  ctx.lineTo(width - 56, 136);
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText('DATOS DEL CLIENTE Y TRAZABILIDAD ERP', 56, 162);

  ctx.font = '12px system-ui, sans-serif';
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText(`Cliente: ${receipt.customer.fullName}`, 56, 186);
  ctx.fillText(`NIT / CI: ${receipt.customer.nitOrCi}`, 380, 186);
  ctx.fillText(`WhatsApp: +591 ${receipt.customer.whatsapp}`, 56, 208);
  ctx.fillText(`Fecha: ${receipt.createdAt}`, 380, 208);
  ctx.fillText(
    `Entrega: ${receipt.customer.city} — ${receipt.customer.address}`,
    56,
    230
  );

  const erpLine = receipt.erpSync
    ? `Factura ERP: ${receipt.erpSync.invoiceRef} | Cliente: ${receipt.erpSync.customerCode} | Despacho: ${receipt.erpSync.warehouseCode} | Banco: ${receipt.erpSync.bankCode}`
    : `Autorización QR: ${receipt.qrAuthCode}`;
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(erpLine, 56, 252);

  let y = 288;
  ctx.fillStyle = '#0b0f19';
  ctx.fillRect(56, y - 20, width - 112, 30);
  ctx.fillStyle = '#00f2fe';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('CANT · PRENDA / VARIANTE', 68, y);
  ctx.fillText('SUBTOTAL (BOB)', width - 170, y);

  y += 32;
  ctx.font = '12px system-ui, sans-serif';
  for (const item of receipt.items) {
    ctx.fillStyle = '#f1f5f9';
    const title = `${item.quantity}x ${item.product.name} (${item.selectedSize} · ${item.selectedColor.name})`;
    ctx.fillText(title.slice(0, 56), 68, y);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    const lineTotal = `Bs ${(item.product.price * item.quantity).toFixed(2)}`;
    ctx.fillText(lineTotal, width - 155, y);

    ctx.strokeStyle = '#1f2937';
    ctx.beginPath();
    ctx.moveTo(68, y + 14);
    ctx.lineTo(width - 68, y + 14);
    ctx.stroke();

    ctx.font = '12px system-ui, sans-serif';
    y += 42;
  }

  y += 12;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('Subtotal Mercadería:', 360, y);
  ctx.fillStyle = '#f8fafc';
  ctx.font = '13px monospace';
  ctx.fillText(`Bs ${receipt.subtotal.toFixed(2)}`, width - 155, y);

  if (receipt.discountAmount > 0) {
    y += 24;
    ctx.fillStyle = '#34d399';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText(`Cupón ${receipt.couponCode} (-15%):`, 360, y);
    ctx.font = '13px monospace';
    ctx.fillText(`-Bs ${receipt.discountAmount.toFixed(2)}`, width - 155, y);
  }

  y += 24;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('Costo de Envío:', 360, y);
  ctx.fillStyle = '#00f2fe';
  ctx.font = 'bold 13px monospace';
  ctx.fillText(
    receipt.shippingCost === 0
      ? 'GRATIS'
      : `Bs ${receipt.shippingCost.toFixed(2)}`,
    width - 155,
    y
  );

  y += 34;
  ctx.fillStyle = '#082f49';
  ctx.beginPath();
  ctx.roundRect(345, y - 22, width - 401, 42, 10);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillText('TOTAL PAGADO:', 360, y + 4);
  ctx.fillStyle = '#00f2fe';
  ctx.font = 'bold 17px monospace';
  ctx.fillText(`Bs ${receipt.totalBob.toFixed(2)}`, width - 165, y + 4);

  y += 44;
  ctx.fillStyle = '#64748b';
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText(
    `IVA 13% incluido (TTC): Bs ${receipt.taxIvaBob.toFixed(2)} · Auth QR: ${receipt.qrAuthCode}`,
    56,
    y
  );

  const link = document.createElement('a');
  link.download = `Comprobante_${receipt.orderRef}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export function CheckoutModal() {
  const {
    items,
    subtotal,
    couponCode,
    discountAmount,
    shippingCost,
    finalTotal,
    isCheckoutOpen,
    closeCheckout,
    openCart,
    clearCart,
    pushToast,
  } = useCart();

  const [step, setStep] = useState<CheckoutStep>('form');
  const [orderRef, setOrderRef] = useState<string>(generateOrderRef);
  const [secondsLeft, setSecondsLeft] = useState<number>(QR_DURATION_SECONDS);
  const [qrNonce, setQrNonce] = useState<number>(1);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [confirmedReceipt, setConfirmedReceipt] =
    useState<OrderReceipt | null>(null);

  const [formData, setFormData] = useState<CustomerCheckoutData>({
    fullName: '',
    whatsapp: '',
    city: 'Cochabamba',
    address: '',
    nitOrCi: '',
    email: '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isCheckoutOpen || step !== 'qr' || secondsLeft <= 0) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isCheckoutOpen, step, secondsLeft]);

  const qrMatrix = useMemo(
    () =>
      buildSimpleQrMatrix(
        `${orderRef}|${finalTotal.toFixed(2)}|${formData.nitOrCi}|${qrNonce}`
      ),
    [orderRef, finalTotal, formData.nitOrCi, qrNonce]
  );

  if (!isCheckoutOpen) return null;

  const handleCloseAll = () => {
    setStep('form');
    setIsVerifying(false);
    setConfirmedReceipt(null);
    setFormError(null);
    closeCheckout();
  };

  const handleProceedToQr = (event: FormEvent) => {
    event.preventDefault();
    const cleanName = formData.fullName.trim();
    const cleanPhone = formData.whatsapp.replace(/\D/g, '');
    const cleanAddress = formData.address.trim();
    const cleanNit = formData.nitOrCi.trim();
    const cleanEmail = formData.email?.trim() ?? '';

    if (cleanName.length < 3) {
      setFormError('Por favor ingresa tu nombre y apellido completo.');
      return;
    }
    if (cleanPhone.length < 7) {
      setFormError(
        'Ingresa un número de WhatsApp válido en Bolivia (ej. 70712345).'
      );
      return;
    }
    if (cleanAddress.length < 5) {
      setFormError('Detalla tu dirección, avenida o zona de entrega.');
      return;
    }
    if (!cleanNit) {
      setFormError('Ingresa tu NIT o CI para facturación (o escribe 0).');
      return;
    }

    setFormError(null);
    setFormData({
      ...formData,
      fullName: cleanName,
      whatsapp: cleanPhone,
      address: cleanAddress,
      nitOrCi: cleanNit,
      email: cleanEmail,
    });
    setOrderRef(generateOrderRef());
    setSecondsLeft(QR_DURATION_SECONDS);
    setStep('qr');
  };

  const handleRegenerateQr = () => {
    setQrNonce((prev) => prev + 1);
    setSecondsLeft(QR_DURATION_SECONDS);
    pushToast({
      title: 'Código Simple QR Renovado',
      message: 'Tienes 5:00 minutos adicionales para escanear el código.',
      type: 'info',
    });
  };

  const handleConfirmPayment = async () => {
    if (secondsLeft === 0 || isVerifying) return;
    setIsVerifying(true);

    const snapshotItems = [...items];
    const snapshotCustomer = { ...formData };
    const snapshotSubtotal = subtotal;
    const snapshotCoupon = couponCode;
    const snapshotDiscount = discountAmount;
    const snapshotShipping = shippingCost;
    const snapshotTotal = finalTotal;

    const discountPercent =
      snapshotCoupon === PROMO_COUPON_CODE ? PROMO_DISCOUNT_RATE * 100 : 0;

    // Ejecuta la saga transaccional desatendida contra Dolibarr 19 (o fallback resiliente)
    const erpSync = await procesarCheckoutDolibarr({
      orderRef,
      customer: snapshotCustomer,
      items: snapshotItems,
      discountPercent,
      shippingCost: snapshotShipping,
      totalBob: snapshotTotal,
    });

    const now = new Date();
    const formattedDate = now.toLocaleString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const taxIvaBob = Number(
      (snapshotTotal - snapshotTotal / 1.13).toFixed(2)
    );

    const receipt: OrderReceipt = {
      orderRef,
      createdAt: formattedDate,
      customer: snapshotCustomer,
      items: snapshotItems,
      subtotal: snapshotSubtotal,
      couponCode: snapshotCoupon,
      discountAmount: snapshotDiscount,
      shippingCost: snapshotShipping,
      totalBob: snapshotTotal,
      taxIvaBob,
      paymentMethod: 'Simple QR Interoperable (BCP / Banco Unión)',
      qrAuthCode: generateAuthCode(),
      erpSync,
    };

    setConfirmedReceipt(receipt);
    setIsVerifying(false);
    setStep('confirmed');
    clearCart();
    launchSharkConfetti();
  };

  const timerPercentage = Math.round((secondsLeft / QR_DURATION_SECONDS) * 100);
  const isTimerUrgent = secondsLeft > 0 && secondsLeft <= 60;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-6 bg-[#050811]/88 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Pasarela de Pago Simple QR Sport Shark"
    >
      <div className="relative my-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-[#00f2fe]/25 bg-[#111827] shadow-[0_28px_90px_rgba(0,0,0,0.85)] animate-modal-reveal">
        {/* Cabecera de Progreso */}
        <div className="no-print flex items-center justify-between border-b border-[#1f2937] bg-[#0b0f19] px-5 sm:px-7 py-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Sport Shark"
              className="h-9 w-9 object-contain"
            />
            <div>
              <h2 className="font-display text-2xl font-black uppercase italic tracking-wide text-white leading-none">
                {step === 'form' && 'Checkout Express Bolivia'}
                {step === 'qr' && 'Pasarela Simple QR Interoperable'}
                {step === 'confirmed' && '¡Orden Confirmada y Facturada!'}
              </h2>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                <span
                  className={
                    step === 'form'
                      ? 'font-bold text-[#00f2fe]'
                      : 'text-emerald-400'
                  }
                >
                  1. Datos y Factura
                </span>
                <span>→</span>
                <span
                  className={
                    step === 'qr'
                      ? 'font-bold text-[#00f2fe]'
                      : step === 'confirmed'
                        ? 'text-emerald-400'
                        : ''
                  }
                >
                  2. Escaneo QR
                </span>
                <span>→</span>
                <span
                  className={
                    step === 'confirmed' ? 'font-bold text-[#00f2fe]' : ''
                  }
                >
                  3. Comprobante ERP
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCloseAll}
            aria-label="Cerrar ventana de pago"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#111827] text-slate-300 transition hover:border-[#00f2fe] hover:text-[#00f2fe] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* PASO 1: FORMULARIO DE DATOS Y FACTURACIÓN */}
        {step === 'form' && (
          <form
            onSubmit={handleProceedToQr}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 sm:p-7"
          >
            <div className="lg:col-span-7 space-y-3.5">
              {formError && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-950/60 px-4 py-2.5 text-xs font-medium text-rose-200">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Nombre Completo / Razón Social *
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="Ej. Sebastián Rojas Quiroga"
                    className="w-full rounded-xl border border-[#1f2937] bg-[#0b0f19] py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-[#00f2fe]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Teléfono WhatsApp *
                  </label>
                  <div className="relative flex">
                    <span className="inline-flex items-center gap-1 rounded-l-xl border border-r-0 border-[#1f2937] bg-[#0b0f19]/60 px-3 font-mono text-xs text-slate-400">
                      <Phone className="h-3.5 w-3.5 text-[#00f2fe]" /> +591
                    </span>
                    <input
                      type="tel"
                      required
                      value={formData.whatsapp}
                      onChange={(e) =>
                        setFormData({ ...formData, whatsapp: e.target.value })
                      }
                      placeholder="70745890"
                      className="w-full rounded-r-xl border border-[#1f2937] bg-[#0b0f19] py-2.5 px-3 font-mono text-sm text-white placeholder-slate-500 outline-none transition focus:border-[#00f2fe]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Ciudad en Bolivia *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        city: e.target.value as BolivianCity,
                      })
                    }
                    className="w-full rounded-xl border border-[#1f2937] bg-[#0b0f19] py-2.5 px-3 text-sm text-white outline-none transition focus:border-[#00f2fe]"
                  >
                    {BOLIVIAN_CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.city === 'Cochabamba' && (
                <div className="flex items-center gap-2 rounded-xl border border-[#00f2fe]/30 bg-[#00f2fe]/10 px-3.5 py-2 text-xs text-[#00f2fe]">
                  <Zap className="h-4 w-4 shrink-0" />
                  <span>
                    <strong>¡Entrega el mismo día activada!</strong> Despacho
                    directo desde almacén <code>ALM-TIENDA</code> en Cochabamba.
                  </span>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Dirección / Zona / Referencia *
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Ej. Av. América esq. Libertador #840, Edif. Orión"
                    className="w-full rounded-xl border border-[#1f2937] bg-[#0b0f19] py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-[#00f2fe]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      NIT o CI Factura *
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, nitOrCi: '0' })}
                      className="text-[11px] font-semibold text-[#00f2fe] hover:underline cursor-pointer"
                    >
                      Sin Nombre (0)
                    </button>
                  </div>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={formData.nitOrCi}
                      onChange={(e) =>
                        setFormData({ ...formData, nitOrCi: e.target.value })
                      }
                      placeholder="Ej. 8492015"
                      className="w-full rounded-xl border border-[#1f2937] bg-[#0b0f19] py-2.5 pl-10 pr-3 font-mono text-sm text-white placeholder-slate-500 outline-none transition focus:border-[#00f2fe]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Correo Factura (Opcional)
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email ?? ''}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="cliente@correo.bo"
                      className="w-full rounded-xl border border-[#1f2937] bg-[#0b0f19] py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-[#00f2fe]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    closeCheckout();
                    openCart();
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#1f2937] bg-[#0b0f19] px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 transition hover:border-slate-600 hover:text-white cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a la Bolsa
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#00f2fe] to-[#0284c7] py-3 px-5 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#0b0f19] shadow-[0_0_24px_rgba(0,242,254,0.3)] transition hover:brightness-110 cursor-pointer"
                >
                  Generar QR Simple · Bs {finalTotal.toFixed(2)}
                </button>
              </div>
            </div>

            {/* Resumen lateral compacto */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-[#1f2937] bg-[#0b0f19]/90 p-4 sm:p-5">
              <div>
                <h3 className="font-display text-xl font-bold uppercase tracking-wide text-white mb-3">
                  Resumen de Orden ({items.length})
                </h3>
                <div className="max-h-52 space-y-2.5 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-200">
                          {item.quantity}x {item.product.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Talla {item.selectedSize} · {item.selectedColor.name}
                        </p>
                      </div>
                      <span className="shrink-0 font-mono font-bold text-white">
                        Bs {(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-2 border-t border-[#1f2937] pt-3 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono">Bs {subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Cupón {couponCode} (-15%)</span>
                    <span className="font-mono">
                      -Bs {discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Envío ({formData.city})</span>
                  <span className="font-mono text-[#00f2fe] font-bold">
                    {shippingCost === 0
                      ? 'GRATIS'
                      : `Bs ${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#1f2937] pt-2.5 text-base font-extrabold text-white">
                  <span>Total BOB (TTC)</span>
                  <span className="font-mono text-[#00f2fe]">
                    Bs {finalTotal.toFixed(2)}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/5 bg-[#111827] p-2.5 text-[11px] text-slate-400">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>
                    Integrado con Dolibarr ERP v19 (Facturación IVA 13% + Stock{' '}
                    <code>ALM-TIENDA</code> + Tesorería <code>BANCO-QR</code>).
                  </span>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* PASO 2: GENERADOR VISUAL SIMPLE QR CON TEMPORIZADOR 5:00 */}
        {step === 'qr' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-5 sm:p-7">
            <div className="md:col-span-6 flex flex-col items-center justify-center rounded-2xl border border-[#00f2fe]/30 bg-[#0b0f19] p-5">
              <div className="mb-3 flex w-full items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#00f2fe]/40 bg-[#00f2fe]/10 px-3 py-1 font-bold text-[#00f2fe]">
                  <QrCode className="h-3.5 w-3.5" /> Simple QR Bolivia
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono font-bold ${
                    secondsLeft === 0
                      ? 'border-rose-500/50 bg-rose-950/70 text-rose-300'
                      : isTimerUrgent
                        ? 'border-amber-400/50 bg-amber-950/70 text-amber-300 animate-pulse'
                        : 'border-emerald-400/40 bg-emerald-950/50 text-emerald-300'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  {formatCountdown(secondsLeft)}
                </span>
              </div>

              <div className="relative rounded-2xl bg-white p-4 shadow-[0_0_35px_rgba(0,242,254,0.22)]">
                {secondsLeft > 0 && (
                  <div className="pointer-events-none absolute left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-[#00f2fe] to-transparent shadow-[0_0_10px_#00f2fe] animate-qr-scan" />
                )}

                <svg
                  viewBox="0 0 25 25"
                  className={`h-52 w-52 sm:h-56 sm:w-56 ${
                    secondsLeft === 0 ? 'opacity-20 blur-[2px]' : ''
                  }`}
                  role="img"
                  aria-label={`Código QR Simple por Bs ${finalTotal.toFixed(2)}`}
                >
                  <rect width="25" height="25" fill="#ffffff" />
                  {qrMatrix.map((row, rIdx) =>
                    row.map((cell, cIdx) =>
                      cell ? (
                        <rect
                          key={`${rIdx}-${cIdx}`}
                          x={cIdx}
                          y={rIdx}
                          width={1}
                          height={1}
                          rx={0.14}
                          fill={
                            (rIdx < 7 && cIdx < 7) ||
                            (rIdx < 7 && cIdx >= 18) ||
                            (rIdx >= 18 && cIdx < 7)
                              ? '#082f49'
                              : '#0b0f19'
                          }
                        />
                      ) : null
                    )
                  )}
                  <rect
                    x="10.2"
                    y="10.2"
                    width="4.6"
                    height="4.6"
                    rx="0.9"
                    fill="#0b0f19"
                    stroke="#00f2fe"
                    strokeWidth="0.35"
                  />
                  <text
                    x="12.5"
                    y="13.2"
                    textAnchor="middle"
                    fill="#00f2fe"
                    fontSize="2.1"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    QR
                  </text>
                </svg>

                {secondsLeft === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-[#0b0f19]/85 p-4 text-center">
                    <p className="font-display text-xl font-bold uppercase text-rose-400">
                      Código QR Expirado
                    </p>
                    <button
                      type="button"
                      onClick={handleRegenerateQr}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-[#00f2fe] px-4 py-2 text-xs font-extrabold uppercase text-[#0b0f19] cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Generar Nuevo QR
                    </button>
                  </div>
                )}

                <div className="mt-2 border-t border-slate-200 pt-2 text-center">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    SPORT SHARK S.R.L. · BANCO-QR (BCP)
                  </p>
                  <p className="font-mono text-sm font-extrabold text-[#082f49]">
                    Monto Exacto: Bs {finalTotal.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-4 w-full">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1f2937]">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      isTimerUrgent ? 'bg-amber-400' : 'bg-[#00f2fe]'
                    }`}
                    style={{ width: `${timerPercentage}%` }}
                  />
                </div>
                <p className="mt-1.5 text-center text-[11px] text-slate-400">
                  Válido en apps bancarias de Bolivia (BCP, Banco Unión, BNB,
                  Mercantil, Yape, Tigo Money)
                </p>
              </div>
            </div>

            <div className="md:col-span-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="rounded-2xl border border-[#1f2937] bg-[#0b0f19]/85 p-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Referencia Web:</span>
                    <span className="font-mono font-bold text-[#00f2fe]">
                      {orderRef}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Beneficiario:</span>
                    <span className="font-semibold text-white">
                      {COMPANY_INFO.legalName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cuenta ERP:</span>
                    <span className="font-mono text-slate-200">
                      BANCO-QR (ID 102 · VIR)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Factura NIT/CI:</span>
                    <span className="font-mono text-slate-200">
                      {formData.nitOrCi}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[#1f2937] pt-2 text-sm font-extrabold">
                    <span className="text-white">Importe QR:</span>
                    <span className="font-mono text-[#00f2fe]">
                      Bs {finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <ol className="space-y-2 rounded-2xl border border-[#1f2937] bg-[#0b0f19]/50 p-4 text-xs text-slate-300">
                  <li className="flex gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00f2fe]/15 font-mono text-[11px] font-bold text-[#00f2fe]">
                      1
                    </span>
                    <span>
                      Abre tu banca móvil y selecciona{' '}
                      <strong className="text-white">Pago Simple QR</strong>.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00f2fe]/15 font-mono text-[11px] font-bold text-[#00f2fe]">
                      2
                    </span>
                    <span>
                      Verifica el concepto{' '}
                      <strong className="font-mono text-[#00f2fe]">
                        {orderRef}
                      </strong>
                      .
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00f2fe]/15 font-mono text-[11px] font-bold text-[#00f2fe]">
                      3
                    </span>
                    <span>
                      Pulsa{' '}
                      <strong className="text-white">Confirmar Pago QR</strong>{' '}
                      para facturar y descontar stock en Dolibarr ERP.
                    </span>
                  </li>
                </ol>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  disabled={secondsLeft === 0 || isVerifying}
                  onClick={() => {
                    void handleConfirmPayment();
                  }}
                  className="w-full rounded-xl bg-gradient-to-r from-[#00f2fe] via-[#38bdf8] to-[#0284c7] py-3.5 px-5 text-sm font-extrabold uppercase tracking-wider text-[#0b0f19] shadow-[0_0_26px_rgba(0,242,254,0.38)] transition hover:brightness-110 disabled:opacity-50 cursor-pointer"
                >
                  {isVerifying ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Facturando y Conciliando en Dolibarr ERP...
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Ya Realicé el Pago · Confirmar QR
                    </span>
                  )}
                </button>

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('form')}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#1f2937] bg-[#0b0f19] px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Editar datos
                  </button>

                  <button
                    type="button"
                    onClick={handleRegenerateQr}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#1f2937] bg-[#0b0f19] px-3.5 py-2 text-xs font-semibold text-[#00f2fe] hover:border-[#00f2fe]/50 cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Renovar tiempo (5:00)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASO 3: CONFIRMACIÓN + AUDITORÍA ERP DOLIBARR + COMPROBANTE */}
        {step === 'confirmed' && confirmedReceipt && (
          <div className="p-5 sm:p-7 space-y-5">
            <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-400/35 bg-emerald-500/10 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-300">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-extrabold uppercase tracking-wide text-white leading-none">
                    ¡Pago QR y Facturación Completados!
                  </h3>
                  <p className="mt-1 text-xs text-slate-300">
                    Orden{' '}
                    <strong className="font-mono text-[#00f2fe]">
                      {confirmedReceipt.orderRef}
                    </strong>{' '}
                    registrada con éxito.
                  </p>
                </div>
              </div>

              {confirmedReceipt.erpSync && (
                <span
                  className={`inline-flex items-center gap-1.5 self-start sm:self-center rounded-full border px-3 py-1 font-mono text-[11px] font-bold ${
                    confirmedReceipt.erpSync.mode === 'live'
                      ? 'border-[#00f2fe]/50 bg-[#0b0f19] text-[#00f2fe]'
                      : 'border-amber-400/40 bg-amber-950/60 text-amber-300'
                  }`}
                >
                  <Database className="h-3.5 w-3.5" />
                  {confirmedReceipt.erpSync.mode === 'live'
                    ? 'DOLIBARR ERP v19 · EN VIVO'
                    : 'MODO OFFLINE / DEMO FALLBACK'}
                </span>
              )}
            </div>

            <div
              id="printable-receipt"
              className="rounded-2xl border border-[#1f2937] bg-[#0b0f19] p-5 sm:p-6 space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#1f2937] pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/logo.png"
                    alt="Sport Shark S.R.L."
                    className="h-12 w-12 object-contain"
                  />
                  <div>
                    <p className="font-display text-2xl font-black uppercase tracking-wider text-white">
                      {COMPANY_INFO.legalName}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      NIT: {COMPANY_INFO.nit} · {COMPANY_INFO.address}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {COMPANY_INFO.city} · Tel: {COMPANY_INFO.phone}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-[#00f2fe]/40 bg-[#111827] px-4 py-2.5 text-right">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Comprobante Digital
                  </span>
                  <span className="font-mono text-lg font-extrabold text-[#00f2fe]">
                    {confirmedReceipt.orderRef}
                  </span>
                  {confirmedReceipt.erpSync && (
                    <span className="block font-mono text-[11px] text-emerald-400">
                      Factura ERP: {confirmedReceipt.erpSync.invoiceRef}
                    </span>
                  )}
                </div>
              </div>

              {/* Trazabilidad técnica ERP Dolibarr */}
              {confirmedReceipt.erpSync && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-xl border border-[#00f2fe]/20 bg-[#111827]/90 p-3 text-[11px]">
                  <div>
                    <span className="block text-slate-400">Tercero CRM</span>
                    <strong className="font-mono text-white">
                      {confirmedReceipt.erpSync.customerCode} (#
                      {confirmedReceipt.erpSync.thirdpartyId})
                    </strong>
                  </div>
                  <div>
                    <span className="block text-slate-400">Factura Validada</span>
                    <strong className="font-mono text-[#00f2fe]">
                      {confirmedReceipt.erpSync.invoiceRef}
                    </strong>
                  </div>
                  <div>
                    <span className="block text-slate-400">Despacho Stock</span>
                    <strong className="font-mono text-white">
                      {confirmedReceipt.erpSync.warehouseCode} (#
                      {confirmedReceipt.erpSync.warehouseId})
                    </strong>
                  </div>
                  <div>
                    <span className="block text-slate-400">Cobro Tesorería</span>
                    <strong className="font-mono text-emerald-400">
                      {confirmedReceipt.erpSync.bankCode} (VIR #
                      {confirmedReceipt.erpSync.paymentId})
                    </strong>
                  </div>
                </div>
              )}

              {/* Datos del cliente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#111827]/70 rounded-xl p-3.5 border border-[#1f2937]">
                <div>
                  <span className="text-slate-400">Cliente: </span>
                  <strong className="text-white">
                    {confirmedReceipt.customer.fullName}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">NIT / CI Factura: </span>
                  <strong className="font-mono text-white">
                    {confirmedReceipt.customer.nitOrCi}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">WhatsApp: </span>
                  <strong className="font-mono text-white">
                    +591 {confirmedReceipt.customer.whatsapp}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">Fecha y Hora: </span>
                  <strong className="font-mono text-white">
                    {confirmedReceipt.createdAt}
                  </strong>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400">Destino de Entrega: </span>
                  <strong className="text-white">
                    {confirmedReceipt.customer.city} —{' '}
                    {confirmedReceipt.customer.address}
                  </strong>
                </div>
              </div>

              {/* Detalle de ítems */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1f2937] text-[11px] uppercase tracking-wider text-slate-400">
                      <th className="py-2">SKU</th>
                      <th className="py-2">Prenda / Variante</th>
                      <th className="py-2 text-center">Cant.</th>
                      <th className="py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f2937]/60">
                    {confirmedReceipt.items.map((item) => (
                      <tr key={item.cartItemId}>
                        <td className="py-2.5 font-mono text-[11px] text-slate-400">
                          {item.product.sku}
                        </td>
                        <td className="py-2.5 text-slate-200">
                          <span className="font-semibold text-white">
                            {item.product.name}
                          </span>{' '}
                          <span className="text-slate-400">
                            (Talla {item.selectedSize} ·{' '}
                            {item.selectedColor.name})
                          </span>
                        </td>
                        <td className="py-2.5 text-center font-mono text-white">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 text-right font-mono font-bold text-white">
                          Bs {(item.product.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-[#1f2937] pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal Mercadería</span>
                  <span className="font-mono">
                    Bs {confirmedReceipt.subtotal.toFixed(2)}
                  </span>
                </div>
                {confirmedReceipt.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>
                      Descuento Cupón {confirmedReceipt.couponCode} (15%)
                    </span>
                    <span className="font-mono">
                      -Bs {confirmedReceipt.discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Envío ({confirmedReceipt.customer.city})</span>
                  <span className="font-mono">
                    {confirmedReceipt.shippingCost === 0
                      ? 'GRATIS'
                      : `Bs ${confirmedReceipt.shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#1f2937] pt-2 text-base font-extrabold text-white">
                  <span>Total Pagado ({confirmedReceipt.paymentMethod})</span>
                  <span className="font-mono text-lg text-[#00f2fe]">
                    Bs {confirmedReceipt.totalBob.toFixed(2)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Régimen Bolivia IVA 13% incluido (Base HT: Bs{' '}
                  {(confirmedReceipt.totalBob / 1.13).toFixed(2)} · Débito
                  Fiscal IVA: Bs {confirmedReceipt.taxIvaBob.toFixed(2)})
                </p>
              </div>
            </div>

            <div className="no-print flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => downloadDigitalReceiptPng(confirmedReceipt)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00f2fe] to-[#0284c7] px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-[#0b0f19] shadow-[0_0_20px_rgba(0,242,254,0.3)] transition hover:brightness-110 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  Descargar Comprobante PNG
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#00f2fe]/40 bg-[#0b0f19] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#00f2fe] transition hover:bg-[#00f2fe]/10 cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir / PDF
                </button>
              </div>

              <button
                type="button"
                onClick={handleCloseAll}
                className="inline-flex items-center gap-2 rounded-xl border border-[#1f2937] bg-[#0b0f19] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:border-slate-500 cursor-pointer"
              >
                <FileCheck2 className="h-4 w-4 text-emerald-400" />
                Finalizar y Seguir Comprando
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
