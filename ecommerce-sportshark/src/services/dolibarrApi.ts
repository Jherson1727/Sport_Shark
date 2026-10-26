import { PRODUCTS } from '../data/products';
import type {
  CartItem,
  CustomerCheckoutData,
  DolibarrSyncSummary,
  ErpSyncMode,
} from '../types';

/**
 * Parámetros corporativos y técnicos de integración con Dolibarr ERP v19.0.2
 * Sport Shark S.R.L. — Cochabamba, Bolivia
 */
export const DOLIBARR_ERP_CONFIG = {
  DIRECT_ENDPOINT: 'http://localhost:8081/api/index.php',
  PROXY_ENDPOINT: '/api/index.php',
  API_KEY: 'sportshark_api_key_2026',
  WAREHOUSE_WEB_ID: 102,
  WAREHOUSE_WEB_CODE: 'ALM-TIENDA',
  BANK_QR_ACCOUNT_ID: 102,
  BANK_QR_CODE: 'BANCO-QR',
  PAYMENT_MODE_VIR_ID: 2, // ID de medio de pago 'VIR' (Transferencia / QR) en llx_c_paiement
  PAYMENT_MODE_VIR_CODE: 'VIR',
  BOLIVIA_COUNTRY_ID: 52,
  IVA_BOLIVIA_PERCENT: 13,
  IVA_DIVISOR_TTC: 1.13,
  DEFAULT_GENERIC_WEB_SOCID: 102, // Tercero 'CU26-0002' (Cliente E-commerce Web)
  TIMEOUT_MS: 4500,
} as const;

/**
 * Resuelve dinámicamente el endpoint base:
 * - En entorno de desarrollo Vite (`import.meta.env.DEV`), enruta por `/api/index.php`
 *   hacia el proxy local (`http://localhost:8081`) evitando bloqueos CORS en el navegador.
 * - En otros entornos o si se define `VITE_DOLIBARR_API_URL`, usa la URL configurada.
 */
function resolveApiBaseUrl(): string {
  const customUrl = import.meta.env?.VITE_DOLIBARR_API_URL as
    | string
    | undefined;
  if (customUrl && customUrl.trim().length > 0) {
    return customUrl.replace(/\/+$/, '');
  }
  return import.meta.env?.DEV
    ? DOLIBARR_ERP_CONFIG.PROXY_ENDPOINT
    : DOLIBARR_ERP_CONFIG.DIRECT_ENDPOINT;
}

/* ============================================================================
 * INTERFACES ESTRICTAS DE PAYLOADS Y RESPUESTAS DOLIBARR v19 REST API
 * ========================================================================== */

export interface DolibarrThirdpartyDto {
  id: string | number;
  name: string;
  code_client?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  town?: string | null;
  idprof1?: string | null;
  tva_intra?: string | null;
  client?: string | number;
  status?: string | number;
}

export interface DolibarrCreateThirdpartyPayload {
  name: string;
  client: '1';
  code_client: string;
  idprof1: string;
  tva_intra: string;
  phone: string;
  email?: string;
  address: string;
  town: string;
  country_id: number;
  status: '1';
  tva_assuj: '1';
}

export interface DolibarrInvoiceLinePayload {
  fk_product?: number;
  desc: string;
  subprice: number;
  qty: number;
  tva_tx: number;
  remise_percent: number;
  product_type: 0 | 1;
}

export interface DolibarrCreateInvoicePayload {
  socid: number;
  type: 0;
  date: number;
  ref_client: string;
  cond_reglement_id: number;
  mode_reglement_id: number;
  note_public: string;
  note_private: string;
  lines: DolibarrInvoiceLinePayload[];
}

export interface DolibarrValidateInvoicePayload {
  idwarehouse: number;
  notrigger: 0 | 1;
}

export interface DolibarrValidatedInvoiceDto {
  id: string | number;
  ref: string;
  total_ht?: string | number;
  total_tva?: string | number;
  total_ttc?: string | number;
  statut?: string | number;
}

export interface DolibarrInvoicePaymentPayload {
  datepaye: number;
  paymentid: number;
  closepaidinvoices: 'yes' | 'no';
  accountid: number;
  num_payment: string;
  comment: string;
}

export interface DolibarrWarehouseStockEntry {
  id?: string | number;
  real: string | number;
}

export interface DolibarrProductStockDto {
  stock_warehouses?: Record<string, DolibarrWarehouseStockEntry>;
  stock_reel?: string | number;
}

/* ============================================================================
 * INTERFACES DE DOMINIO PARA EL FRONTEND E-COMMERCE
 * ========================================================================== */

export interface ClienteErpInput {
  fullName: string;
  nitOrCi: string;
  whatsapp: string;
  city: string;
  address: string;
  email?: string;
}

export interface ClienteErpResult {
  thirdpartyId: number;
  customerCode: string;
  created: boolean;
  mode: ErpSyncMode;
}

export interface OrdenFacturaErpInput {
  socid: number;
  orderRef: string;
  items: CartItem[];
  discountPercent?: number;
  shippingCost?: number;
  customerNotes?: string;
}

export interface FacturaErpResult {
  invoiceId: number;
  invoiceRef: string;
  warehouseId: number;
  warehouseCode: string;
  baseHtBob: number;
  ivaBob: number;
  totalTtcBob: number;
  mode: ErpSyncMode;
}

export interface CobroBancarioErpResult {
  paymentId: number;
  invoiceId: number;
  bankAccountId: number;
  bankCode: string;
  paymentCode: string;
  amountBob: number;
  orderRef: string;
  mode: ErpSyncMode;
}

export interface ConsultaStockErpResult {
  productId: number;
  warehouseId: number;
  warehouseCode: string;
  availableStock: number;
  totalCompanyStock: number;
  isAvailable: boolean;
  mode: ErpSyncMode;
  checkedAt: number;
}

/* ============================================================================
 * MANEJO DE ERRORES Y CLIENTE HTTP CON INYECCIÓN DE DOLAPIKEY + FALLBACK
 * ========================================================================== */

class DolibarrHttpStatusError extends Error {
  public readonly status: number;
  public readonly responseBody: string;

  constructor(status: number, responseBody: string) {
    super(`Dolibarr HTTP ${status}: ${responseBody}`);
    this.name = 'DolibarrHttpStatusError';
    this.status = status;
    this.responseBody = responseBody;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  timeoutMs?: number;
}

/**
 * Ejecuta una petición autenticada contra Dolibarr REST API inyectando
 * automáticamente `DOLAPIKEY` y `Content-Type: application/json`.
 */
async function dolibarrFetch<T>(
  endpointPath: string,
  options: RequestOptions = {}
): Promise<T> {
  const baseUrl = resolveApiBaseUrl();
  const normalizedPath = endpointPath.startsWith('/')
    ? endpointPath
    : `/${endpointPath}`;
  const url = `${baseUrl}${normalizedPath}`;

  const controller = new AbortController();
  const timeout = window.setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DOLIBARR_ERP_CONFIG.TIMEOUT_MS
  );

  try {
    const headers = new Headers(options.headers);
    headers.set('DOLAPIKEY', DOLIBARR_ERP_CONFIG.API_KEY);
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');

    const response = await fetch(url, {
      ...options,
      headers,
      body:
        options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    const rawText = await response.text();

    if (!response.ok) {
      throw new DolibarrHttpStatusError(response.status, rawText);
    }

    if (!rawText) {
      return undefined as T;
    }

    return JSON.parse(rawText) as T;
  } finally {
    window.clearTimeout(timeout);
  }
}

/* ============================================================================
 * UTILIDADES TRIBUTARIAS BOLIVIA (IVA 13% MODALIDAD TTC -> HT)
 * ========================================================================== */

export function calcularBaseHtBolivia(montoTtc: number): {
  baseHt: number;
  ivaBob: number;
  totalTtc: number;
} {
  const totalTtc = Number(montoTtc.toFixed(2));
  const baseHt = Number(
    (totalTtc / DOLIBARR_ERP_CONFIG.IVA_DIVISOR_TTC).toFixed(6)
  );
  const ivaBob = Number((totalTtc - baseHt).toFixed(2));
  return { baseHt, ivaBob, totalTtc };
}

function sanitizeUniversalFilterValue(value: string): string {
  return value.replace(/['"\\():;]/g, '').trim();
}

function generateCustomerErpCode(): string {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `CU26-${randomDigits}`;
}

function generateSimulatedInvoiceRef(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const seq = Math.floor(1000 + Math.random() * 8999);
  return `FA${yy}${mm}-${seq}`;
}

/* Caché ligera en memoria (12s) para consultas repetidas de stock en vitrina */
const stockCache = new Map<number, ConsultaStockErpResult>();
const STOCK_CACHE_TTL_MS = 12_000;

export function invalidarCacheStockErp(productId?: number): void {
  if (typeof productId === 'number') {
    stockCache.delete(productId);
  } else {
    stockCache.clear();
  }
}

/* ============================================================================
 * 1. FLUJO TRANSACCIONAL: VERIFICAR O CREAR TERCERO (CRM)
 * ========================================================================== */

/**
 * Busca si el cliente ya existe en Dolibarr por NIT/CI (`t.siren`) o Email (`t.email`)
 * mediante `GET /thirdparties`. Si no existe (HTTP 404 o lista vacía), lo registra
 * en `POST /thirdparties` con código `CU26-XXXX`.
 * Si el ERP está apagado o inaccesible, activa el modo Offline/Demo tolerante a fallos.
 */
export async function verificarOCrearCliente(
  clienteData: ClienteErpInput
): Promise<ClienteErpResult> {
  const cleanNit = sanitizeUniversalFilterValue(clienteData.nitOrCi);
  const cleanEmail = clienteData.email
    ? sanitizeUniversalFilterValue(clienteData.email)
    : '';

  try {
    // Caso especial: consumidor final "Sin Nombre (0)" sin correo usa el tercero web genérico si existe
    if ((!cleanNit || cleanNit === '0') && !cleanEmail) {
      const genericFilter = encodeURIComponent("(t.code_client:=:'CU26-0002')");
      try {
        const genericMatches = await dolibarrFetch<DolibarrThirdpartyDto[]>(
          `/thirdparties?sqlfilters=${genericFilter}&limit=1`,
          { method: 'GET' }
        );
        if (Array.isArray(genericMatches) && genericMatches.length > 0) {
          return {
            thirdpartyId: Number(genericMatches[0].id),
            customerCode: genericMatches[0].code_client ?? 'CU26-0002',
            created: false,
            mode: 'live',
          };
        }
      } catch (err) {
        if (
          !(err instanceof DolibarrHttpStatusError && err.status === 404)
        ) {
          throw err;
        }
      }
    } else {
      // Construir filtro universal Dolibarr v19 por NIT/CI y/o Email
      const clauses: string[] = [];
      if (cleanNit && cleanNit !== '0') {
        clauses.push(`(t.siren:=:'${cleanNit}')`);
      }
      if (cleanEmail) {
        clauses.push(`(t.email:=:'${cleanEmail}')`);
      }

      const rawFilter =
        clauses.length > 1 ? `(${clauses.join('or')})` : clauses[0];

      try {
        const existing = await dolibarrFetch<DolibarrThirdpartyDto[]>(
          `/thirdparties?sqlfilters=${encodeURIComponent(rawFilter)}&limit=1`,
          { method: 'GET' }
        );

        if (Array.isArray(existing) && existing.length > 0) {
          const matched = existing[0];
          return {
            thirdpartyId: Number(matched.id),
            customerCode: matched.code_client ?? generateCustomerErpCode(),
            created: false,
            mode: 'live',
          };
        }
      } catch (err) {
        // Dolibarr responde HTTP 404 cuando sqlfilters no encuentra coincidencias: procedemos a crear
        if (
          !(err instanceof DolibarrHttpStatusError && err.status === 404)
        ) {
          throw err;
        }
      }
    }

    // Crear nuevo tercero en Dolibarr con código CU26-XXXX
    const customerCode = generateCustomerErpCode();
    const cleanPhone = clienteData.whatsapp.replace(/\D/g, '');
    const createPayload: DolibarrCreateThirdpartyPayload = {
      name: clienteData.fullName.trim(),
      client: '1',
      code_client: customerCode,
      idprof1: cleanNit || '0',
      tva_intra: cleanNit || '0',
      phone: cleanPhone.startsWith('591')
        ? `+${cleanPhone}`
        : `+591 ${cleanPhone}`,
      ...(cleanEmail ? { email: cleanEmail } : {}),
      address: clienteData.address.trim(),
      town: clienteData.city.trim(),
      country_id: DOLIBARR_ERP_CONFIG.BOLIVIA_COUNTRY_ID,
      status: '1',
      tva_assuj: '1',
    };

    const createdId = await dolibarrFetch<number | string>('/thirdparties', {
      method: 'POST',
      body: createPayload,
    });

    return {
      thirdpartyId: Number(createdId),
      customerCode,
      created: true,
      mode: 'live',
    };
  } catch (error) {
    console.warn(
      '[SportShark ERP Fallback] verificarOCrearCliente operando en modo Offline/Demo:',
      error
    );
    return {
      thirdpartyId: Math.floor(9000 + Math.random() * 900),
      customerCode: generateCustomerErpCode(),
      created: true,
      mode: 'offline-fallback',
    };
  }
}

/**
 * Alias exacto requerido por especificación técnica (`verificarOrearCliente`).
 */
export const verificarOrearCliente = verificarOCrearCliente;

/* ============================================================================
 * 2. FLUJO TRANSACCIONAL: CREAR FACTURA + VALIDAR Y DESCONTAR STOCK ALM-TIENDA
 * ========================================================================== */

/**
 * Genera la factura borrador en `POST /invoices` desglosando el IVA 13% boliviano
 * (Base HT = Precio TTC / 1.13, `tva_tx = 13`) y acto seguido la valida mediante
 * `POST /invoices/{id}/validate` indicando `idwarehouse: 102` (`ALM-TIENDA`),
 * descontando automáticamente las unidades físicas vendidas.
 */
export async function crearFacturaConStock(
  orden: OrdenFacturaErpInput
): Promise<FacturaErpResult> {
  const discountPercent = orden.discountPercent ?? 0;
  const shippingCost = orden.shippingCost ?? 0;
  const nowUnix = Math.floor(Date.now() / 1000);

  // Construir líneas de productos físicos vinculadas a su ID en Dolibarr (fk_product)
  const lines: DolibarrInvoiceLinePayload[] = orden.items.map((item) => {
    const unitHt = Number(
      (item.product.price / DOLIBARR_ERP_CONFIG.IVA_DIVISOR_TTC).toFixed(6)
    );

    return {
      fk_product: item.product.id,
      desc: `${item.product.name} | Talla: ${item.selectedSize} | Color: ${item.selectedColor.name} (SKU: ${item.product.sku})`,
      subprice: unitHt,
      qty: item.quantity,
      tva_tx: DOLIBARR_ERP_CONFIG.IVA_BOLIVIA_PERCENT,
      remise_percent: discountPercent,
      product_type: 0,
    };
  });

  // Si aplica cargo logístico de envío, se incorpora como línea de servicio (product_type: 1)
  if (shippingCost > 0) {
    const shippingHt = Number(
      (shippingCost / DOLIBARR_ERP_CONFIG.IVA_DIVISOR_TTC).toFixed(6)
    );
    lines.push({
      desc: 'Servicio de Despacho y Courier Nacional Bolivia',
      subprice: shippingHt,
      qty: 1,
      tva_tx: DOLIBARR_ERP_CONFIG.IVA_BOLIVIA_PERCENT,
      remise_percent: 0,
      product_type: 1,
    });
  }

  // Cálculo local exacto de respaldo y verificación tributaria
  const grossMerchandise = orden.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const netMerchandise = grossMerchandise * (1 - discountPercent / 100);
  const expectedTotalTtc = Number((netMerchandise + shippingCost).toFixed(2));
  const fiscalBreakdown = calcularBaseHtBolivia(expectedTotalTtc);

  try {
    const createPayload: DolibarrCreateInvoicePayload = {
      socid: orden.socid,
      type: 0,
      date: nowUnix,
      ref_client: orden.orderRef,
      cond_reglement_id: 1,
      mode_reglement_id: DOLIBARR_ERP_CONFIG.PAYMENT_MODE_VIR_ID,
      note_public: `Orden E-commerce Sport Shark ${orden.orderRef}`,
      note_private:
        orden.customerNotes ??
        `Generada automáticamente desde Tienda Web | Almacén ${DOLIBARR_ERP_CONFIG.WAREHOUSE_WEB_CODE}`,
      lines,
    };

    const rawInvoiceId = await dolibarrFetch<number | string>('/invoices', {
      method: 'POST',
      body: createPayload,
    });
    const invoiceId = Number(rawInvoiceId);

    const validatePayload: DolibarrValidateInvoicePayload = {
      idwarehouse: DOLIBARR_ERP_CONFIG.WAREHOUSE_WEB_ID,
      notrigger: 0,
    };

    const validatedInvoice = await dolibarrFetch<DolibarrValidatedInvoiceDto>(
      `/invoices/${invoiceId}/validate`,
      {
        method: 'POST',
        body: validatePayload,
      }
    );

    // Invalidar caché local de inventario tras descontar existencias en ALM-TIENDA
    invalidarCacheStockErp();

    return {
      invoiceId,
      invoiceRef: validatedInvoice?.ref
        ? String(validatedInvoice.ref)
        : generateSimulatedInvoiceRef(),
      warehouseId: DOLIBARR_ERP_CONFIG.WAREHOUSE_WEB_ID,
      warehouseCode: DOLIBARR_ERP_CONFIG.WAREHOUSE_WEB_CODE,
      baseHtBob: validatedInvoice?.total_ht
        ? Number(Number(validatedInvoice.total_ht).toFixed(2))
        : Number(fiscalBreakdown.baseHt.toFixed(2)),
      ivaBob: validatedInvoice?.total_tva
        ? Number(Number(validatedInvoice.total_tva).toFixed(2))
        : fiscalBreakdown.ivaBob,
      totalTtcBob: validatedInvoice?.total_ttc
        ? Number(Number(validatedInvoice.total_ttc).toFixed(2))
        : fiscalBreakdown.totalTtc,
      mode: 'live',
    };
  } catch (error) {
    console.warn(
      '[SportShark ERP Fallback] crearFacturaConStock operando en modo Offline/Demo:',
      error
    );
    return {
      invoiceId: Math.floor(5000 + Math.random() * 4000),
      invoiceRef: generateSimulatedInvoiceRef(),
      warehouseId: DOLIBARR_ERP_CONFIG.WAREHOUSE_WEB_ID,
      warehouseCode: DOLIBARR_ERP_CONFIG.WAREHOUSE_WEB_CODE,
      baseHtBob: Number(fiscalBreakdown.baseHt.toFixed(2)),
      ivaBob: fiscalBreakdown.ivaBob,
      totalTtcBob: fiscalBreakdown.totalTtc,
      mode: 'offline-fallback',
    };
  }
}

/* ============================================================================
 * 3. FLUJO TRANSACCIONAL: ASENTAR COBRO QR EN CUENTA BANCARIA BANCO-QR (102)
 * ========================================================================== */

/**
 * Registra el cobro de la factura en `POST /invoices/{id}/payments` asignando
 * medio de pago Transferencia (`VIR`, ID 2), conciliando el importe en la cuenta
 * bancaria `BANCO-QR` (ID 102 — Banco BCP BOB) y marcando la factura como Pagada.
 */
export async function asentarCobroBancario(
  facturaId: number,
  monto: number,
  refOrden: string
): Promise<CobroBancarioErpResult> {
  const nowUnix = Math.floor(Date.now() / 1000);
  const roundedAmount = Number(monto.toFixed(2));

  try {
    const paymentPayload: DolibarrInvoicePaymentPayload = {
      datepaye: nowUnix,
      paymentid: DOLIBARR_ERP_CONFIG.PAYMENT_MODE_VIR_ID,
      closepaidinvoices: 'yes',
      accountid: DOLIBARR_ERP_CONFIG.BANK_QR_ACCOUNT_ID,
      num_payment: refOrden,
      comment: `Cobro Simple QR Interoperable (${DOLIBARR_ERP_CONFIG.PAYMENT_MODE_VIR_CODE}) | Orden ${refOrden} | Bs ${roundedAmount.toFixed(2)}`,
    };

    const rawPaymentId = await dolibarrFetch<number | string>(
      `/invoices/${facturaId}/payments`,
      {
        method: 'POST',
        body: paymentPayload,
      }
    );

    return {
      paymentId: Number(rawPaymentId),
      invoiceId: facturaId,
      bankAccountId: DOLIBARR_ERP_CONFIG.BANK_QR_ACCOUNT_ID,
      bankCode: DOLIBARR_ERP_CONFIG.BANK_QR_CODE,
      paymentCode: DOLIBARR_ERP_CONFIG.PAYMENT_MODE_VIR_CODE,
      amountBob: roundedAmount,
      orderRef: refOrden,
      mode: 'live',
    };
  } catch (error) {
    console.warn(
      '[SportShark ERP Fallback] asentarCobroBancario operando en modo Offline/Demo:',
      error
    );
    return {
      paymentId: Math.floor(7000 + Math.random() * 2500),
      invoiceId: facturaId,
      bankAccountId: DOLIBARR_ERP_CONFIG.BANK_QR_ACCOUNT_ID,
      bankCode: DOLIBARR_ERP_CONFIG.BANK_QR_CODE,
      paymentCode: DOLIBARR_ERP_CONFIG.PAYMENT_MODE_VIR_CODE,
      amountBob: roundedAmount,
      orderRef: refOrden,
      mode: 'offline-fallback',
    };
  }
}

/* ============================================================================
 * 4. SINCRONIZACIÓN DE INVENTARIO EN TIEMPO REAL (GET /products/{id}/stock)
 * ========================================================================== */

/**
 * Consulta en tiempo real `GET /products/{id}/stock` en Dolibarr ERP para validar
 * las unidades disponibles en el almacén de despacho web `ALM-TIENDA` (ID: 102)
 * antes de agregar una prenda al carrito.
 * Si el ERP no responde, retorna de forma transparente el stock local de respaldo.
 */
export async function consultarStockProducto(
  productId: number,
  fallbackLocalStock?: number
): Promise<ConsultaStockErpResult> {
  const cached = stockCache.get(productId);
  if (cached && Date.now() - cached.checkedAt < STOCK_CACHE_TTL_MS) {
    return cached;
  }

  try {
    const stockData = await dolibarrFetch<DolibarrProductStockDto>(
      `/products/${productId}/stock`,
      {
        method: 'GET',
        timeoutMs: 3000,
      }
    );

    const warehouses = stockData?.stock_warehouses ?? {};
    const warehouseKey = String(DOLIBARR_ERP_CONFIG.WAREHOUSE_WEB_ID);
    const almTiendaRaw = warehouses[warehouseKey]?.real;

    // Si existe desglose del almacén 102 (ALM-TIENDA), usamos ese saldo exacto
    const availableInTienda =
      almTiendaRaw !== undefined
        ? Math.max(0, Math.floor(Number(almTiendaRaw)))
        : stockData?.stock_reel !== undefined
          ? Math.max(0, Math.floor(Number(stockData.stock_reel)))
          : 0;

    const totalCompanyStock = Object.values(warehouses).reduce(
      (sum, wh) => sum + Math.max(0, Math.floor(Number(wh?.real ?? 0))),
      0
    );

    const result: ConsultaStockErpResult = {
      productId,
      warehouseId: DOLIBARR_ERP_CONFIG.WAREHOUSE_WEB_ID,
      warehouseCode: DOLIBARR_ERP_CONFIG.WAREHOUSE_WEB_CODE,
      availableStock: availableInTienda,
      totalCompanyStock:
        totalCompanyStock > 0 ? totalCompanyStock : availableInTienda,
      isAvailable: availableInTienda > 0,
      mode: 'live',
      checkedAt: Date.now(),
    };

    stockCache.set(productId, result);
    return result;
  } catch (error) {
    console.warn(
      `[SportShark ERP Fallback] consultarStockProducto(${productId}) usando stock local:`,
      error
    );
    const catalogFallback =
      fallbackLocalStock ??
      PRODUCTS.find((p) => p.id === productId)?.stock ??
      10;

    return {
      productId,
      warehouseId: DOLIBARR_ERP_CONFIG.WAREHOUSE_WEB_ID,
      warehouseCode: DOLIBARR_ERP_CONFIG.WAREHOUSE_WEB_CODE,
      availableStock: catalogFallback,
      totalCompanyStock: catalogFallback,
      isAvailable: catalogFallback > 0,
      mode: 'offline-fallback',
      checkedAt: Date.now(),
    };
  }
}

/* ============================================================================
 * 5. ORQUESTADOR TRANSACCIONAL COMPLETO PARA CHECKOUT E-COMMERCE
 * ========================================================================== */

export interface CheckoutErpOrchestrationInput {
  orderRef: string;
  customer: CustomerCheckoutData;
  items: CartItem[];
  discountPercent: number;
  shippingCost: number;
  totalBob: number;
}

/**
 * Ejecuta de principio a fin el flujo desatendido Checkout -> Dolibarr 19:
 * 1) `verificarOCrearCliente`
 * 2) `crearFacturaConStock` (descuento automático en `ALM-TIENDA` ID 102)
 * 3) `asentarCobroBancario` (abono vía `VIR` en `BANCO-QR` ID 102)
 */
export async function procesarCheckoutDolibarr(
  input: CheckoutErpOrchestrationInput
): Promise<DolibarrSyncSummary> {
  const clienteRes = await verificarOCrearCliente({
    fullName: input.customer.fullName,
    nitOrCi: input.customer.nitOrCi,
    whatsapp: input.customer.whatsapp,
    city: input.customer.city,
    address: input.customer.address,
    email: input.customer.email,
  });

  // Si el cliente se resolvió en modo offline-fallback, evitamos llamadas adicionales fallidas
  if (clienteRes.mode === 'offline-fallback') {
    const fiscal = calcularBaseHtBolivia(input.totalBob);
    void fiscal;
    return {
      mode: 'offline-fallback',
      thirdpartyId: clienteRes.thirdpartyId,
      customerCode: clienteRes.customerCode,
      invoiceId: Math.floor(5000 + Math.random() * 4000),
      invoiceRef: generateSimulatedInvoiceRef(),
      paymentId: Math.floor(7000 + Math.random() * 2500),
      warehouseCode: DOLIBARR_ERP_CONFIG.WAREHOUSE_WEB_CODE,
      warehouseId: DOLIBARR_ERP_CONFIG.WAREHOUSE_WEB_ID,
      bankCode: DOLIBARR_ERP_CONFIG.BANK_QR_CODE,
      bankAccountId: DOLIBARR_ERP_CONFIG.BANK_QR_ACCOUNT_ID,
    };
  }

  const facturaRes = await crearFacturaConStock({
    socid: clienteRes.thirdpartyId,
    orderRef: input.orderRef,
    items: input.items,
    discountPercent: input.discountPercent,
    shippingCost: input.shippingCost,
  });

  const cobroRes =
    facturaRes.mode === 'live'
      ? await asentarCobroBancario(
          facturaRes.invoiceId,
          facturaRes.totalTtcBob,
          input.orderRef
        )
      : {
          paymentId: Math.floor(7000 + Math.random() * 2500),
          mode: 'offline-fallback' as ErpSyncMode,
        };

  const finalMode: ErpSyncMode =
    clienteRes.mode === 'live' &&
    facturaRes.mode === 'live' &&
    cobroRes.mode === 'live'
      ? 'live'
      : 'offline-fallback';

  return {
    mode: finalMode,
    thirdpartyId: clienteRes.thirdpartyId,
    customerCode: clienteRes.customerCode,
    invoiceId: facturaRes.invoiceId,
    invoiceRef: facturaRes.invoiceRef,
    paymentId: cobroRes.paymentId,
    warehouseCode: DOLIBARR_ERP_CONFIG.WAREHOUSE_WEB_CODE,
    warehouseId: DOLIBARR_ERP_CONFIG.WAREHOUSE_WEB_ID,
    bankCode: DOLIBARR_ERP_CONFIG.BANK_QR_CODE,
    bankAccountId: DOLIBARR_ERP_CONFIG.BANK_QR_ACCOUNT_ID,
  };
}
