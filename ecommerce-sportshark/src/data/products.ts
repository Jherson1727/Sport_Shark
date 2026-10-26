import type {
  BolivianCity,
  FilterCategory,
  Product,
  ProductSize,
} from '../types';

export const CATEGORIES: FilterCategory[] = [
  'Todos',
  'Poleras',
  'Shorts',
  'Calzado',
  'Buzos',
  'Accesorios',
];

export const PRODUCT_SIZES: ProductSize[] = ['S', 'M', 'L', 'XL'];

export const BOLIVIAN_CITIES: BolivianCity[] = [
  'Cochabamba',
  'Santa Cruz',
  'La Paz',
  'El Alto',
  'Sucre',
  'Tarija',
  'Oruro',
  'Potosí',
  'Trinidad',
  'Cobija',
];

export const FREE_SHIPPING_THRESHOLD = 300;
export const STANDARD_SHIPPING_COST = 25;
export const PROMO_COUPON_CODE = 'SHARK15';
export const PROMO_DISCOUNT_RATE = 0.15;

export const COMPANY_INFO = {
  legalName: 'Sport Shark S.R.L.',
  nit: '3849201028',
  address: 'Av. Pando esq. Portales #1240, Zona Recoleta',
  city: 'Cochabamba, Bolivia',
  phone: '+591 4 4589234',
  whatsappSupport: '59170789234',
  email: 'contacto@sportshark.bo',
  bankLabel: 'Banco de Crédito BCP · Cuenta Corriente BOB (Simple QR)',
} as const;

export const PRODUCTS: Product[] = [
  {
    id: 101,
    sku: 'TSH-NK-01',
    name: 'Polera Nike Dri-FIT Shark Edition',
    brand: 'Nike Performance',
    category: 'Poleras',
    price: 250,
    originalPrice: 295,
    description:
      'Tejido técnico microperforado de evacuación rápida del sudor con corte atlético en hombros y pecho para entrenamientos de alta intensidad.',
    image:
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=900&q=80',
    hoverImage:
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=80',
    stock: 14,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { id: 'obsidiana', name: 'Negro Obsidiana', hex: '#0f172a' },
      { id: 'cyan-neon', name: 'Cyan Tiburón', hex: '#00f2fe' },
      { id: 'titanio', name: 'Gris Titanio', hex: '#64748b' },
    ],
    tags: ['Bestseller', 'Eco-Dry'],
    rating: 4.9,
    reviewsCount: 128,
    fitLabel: 'Muscle Fit Atlético',
  },
  {
    id: 106,
    sku: 'TSH-AN-01',
    name: 'Polera Algodón Andina Oversize Pump',
    brand: 'Andina Lab',
    category: 'Poleras',
    price: 90,
    originalPrice: 120,
    description:
      'Algodón peinado pesado de 240 GSM con caída estructurada drop-shoulder. Ideal como pump cover en gimnasio o look urbano athleisure.',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
    hoverImage:
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=80',
    stock: 22,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { id: 'glaciar', name: 'Blanco Glaciar', hex: '#f8fafc' },
      { id: 'carbon', name: 'Carbón Nocturno', hex: '#1e293b' },
      { id: 'abismo', name: 'Azul Abismo', hex: '#0284c7' },
    ],
    tags: ['Athleisure', 'Bestseller'],
    rating: 4.8,
    reviewsCount: 94,
    fitLabel: 'Oversize Relaxed',
  },
  {
    id: 102,
    sku: 'SHO-PU-01',
    name: 'Short Deportivo Puma Velocity 5"',
    brand: 'Puma Training',
    category: 'Shorts',
    price: 180,
    originalPrice: 215,
    description:
      'Ultraligero con elasticidad en 4 direcciones, aberturas laterales láser para sentadilla profunda y bolsillos invisibles con cierre.',
    image:
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=900&q=80',
    hoverImage:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
    stock: 9,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { id: 'negro-mate', name: 'Negro Mate', hex: '#111827' },
      { id: 'azul-electrico', name: 'Azul Eléctrico', hex: '#0284c7' },
      { id: 'grafito', name: 'Gris Grafito', hex: '#475569' },
    ],
    tags: ['Eco-Dry', 'Bestseller'],
    rating: 4.9,
    reviewsCount: 83,
    fitLabel: 'Entrepierna 5" Performance',
  },
  {
    id: 105,
    sku: 'CAL-NK-01',
    name: 'Calza Deportiva Mujer Nike Sculpt Seamless',
    brand: 'Nike Women',
    category: 'Shorts',
    price: 280,
    originalPrice: 330,
    description:
      'Pretina alta compresiva sin costuras que estiliza la silueta, tejido squat-proof cero transparencias y control térmico transpirable.',
    image:
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=900&q=80',
    hoverImage:
      'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?auto=format&fit=crop&w=900&q=80',
    stock: 7,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { id: 'onix', name: 'Negro Ónix', hex: '#090d16' },
      { id: 'petroleo', name: 'Petróleo Neón', hex: '#0891b2' },
      { id: 'acero', name: 'Gris Acero', hex: '#64748b' },
    ],
    tags: ['Athleisure', 'Eco-Dry'],
    rating: 5.0,
    reviewsCount: 112,
    fitLabel: 'High-Waist Compresivo',
  },
  {
    id: 103,
    sku: 'ZAP-AD-01',
    name: 'Zapatillas Adidas Duramo Speed Pro',
    brand: 'Adidas Running',
    category: 'Calzado',
    price: 550,
    originalPrice: 640,
    description:
      'Mediasuela Lightstrike reactiva y malla técnica transpirable para asfalto, caminadora y sesiones híbridas de CrossFit y HIIT.',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    hoverImage:
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80',
    stock: 6,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { id: 'crimson-noir', name: 'Rojo Pulso / Negro', hex: '#dc2626' },
      { id: 'shark-black', name: 'Negro / Cyan', hex: '#0b0f19' },
      { id: 'cobalto', name: 'Azul Cobalto', hex: '#0369a1' },
    ],
    tags: ['Bestseller', 'Eco-Dry'],
    rating: 4.9,
    reviewsCount: 156,
    fitLabel: 'S(38-39) · M(40-41) · L(42-43) · XL(44)',
  },
  {
    id: 108,
    sku: 'ZAP-AN-01',
    name: 'Zapatillas Running Andina Nitro Grip',
    brand: 'Andina Performance',
    category: 'Calzado',
    price: 280,
    originalPrice: 340,
    description:
      'Suela de caucho de alta tracción adaptada a topografía urbana y parques de Cochabamba, con plantilla ortopédica de retorno de energía.',
    image:
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=80',
    hoverImage:
      'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=900&q=80',
    stock: 11,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { id: 'blanco-artico', name: 'Blanco Ártico', hex: '#e2e8f0' },
      { id: 'volcanico', name: 'Gris Volcánico', hex: '#334155' },
      { id: 'cyan-rush', name: 'Cyan Rush', hex: '#06b6d4' },
    ],
    tags: ['Athleisure', 'Eco-Dry'],
    rating: 4.7,
    reviewsCount: 67,
    fitLabel: 'S(38-39) · M(40-41) · L(42-43) · XL(44)',
  },
  {
    id: 104,
    sku: 'BUZ-UA-01',
    name: 'Buzo Jogger Under Armour Rival Tapered',
    brand: 'Under Armour',
    category: 'Buzos',
    price: 320,
    originalPrice: 375,
    description:
      'Tejido polar ligero cepillado por dentro con corte cónico en tobillos, cintura elástica reforzada y estética limpia calle-gimnasio.',
    image:
      'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=900&q=80',
    hoverImage:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
    stock: 8,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { id: 'asfalto', name: 'Negro Asfalto', hex: '#111827' },
      { id: 'jaspeado', name: 'Gris Jaspeado', hex: '#6b7280' },
      { id: 'marino', name: 'Marino Profundo', hex: '#0c4a6e' },
    ],
    tags: ['Athleisure', 'Bestseller'],
    rating: 4.8,
    reviewsCount: 91,
    fitLabel: 'Tapered Slim Fit',
  },
  {
    id: 107,
    sku: 'SUD-AD-01',
    name: 'Sudadera Capucha Adidas AeroReady Heavy',
    brand: 'Adidas Sportswear',
    category: 'Buzos',
    price: 400,
    originalPrice: 465,
    description:
      'Hoodie estructurada de alto gramaje con capucha de doble panel, bolsillo canguro oculto y retención térmica para mañanas frías.',
    image:
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80',
    hoverImage:
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80',
    stock: 5,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { id: 'carbono', name: 'Negro Carbono', hex: '#090d16' },
      { id: 'shark-blue', name: 'Azul Tiburón', hex: '#0284c7' },
      { id: 'piedra', name: 'Piedra Urbano', hex: '#94a3b8' },
    ],
    tags: ['Bestseller', 'Athleisure'],
    rating: 4.9,
    reviewsCount: 104,
    fitLabel: 'Boxy Athletic Fit',
  },
  {
    id: 109,
    sku: 'ACC-PU-01',
    name: 'Mochila Deportiva Puma Tactical Gym 28L',
    brand: 'Puma Accessories',
    category: 'Accesorios',
    price: 240,
    originalPrice: 285,
    description:
      'Compartimento ventilado independiente para calzado, bolsillo acolchado para laptop 16", base impermeable y correas ergonómicas.',
    image:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
    hoverImage:
      'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=900&q=80',
    stock: 12,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { id: 'tactico', name: 'Negro Táctico', hex: '#0f172a' },
      { id: 'acero-azul', name: 'Azul Acero', hex: '#0369a1' },
      { id: 'tormenta', name: 'Gris Tormenta', hex: '#475569' },
    ],
    tags: ['Athleisure', 'Eco-Dry'],
    rating: 4.8,
    reviewsCount: 58,
    fitLabel: 'Capacidad Modular 28L',
  },
  {
    id: 110,
    sku: 'ACC-AD-01',
    name: 'Calcetines Adidas Cushioned Crew (Pack x3)',
    brand: 'Adidas Training',
    category: 'Accesorios',
    price: 70,
    originalPrice: 90,
    description:
      'Pack de 3 pares de media caña con soporte compresivo en el arco plantar, talón reforzado anti-ampollas y fibras frescas Eco-Dry.',
    image:
      'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=900&q=80',
    hoverImage:
      'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?auto=format&fit=crop&w=900&q=80',
    stock: 30,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { id: 'pack-blanco', name: 'Pack Blanco Clásico', hex: '#f1f5f9' },
      { id: 'pack-negro', name: 'Pack Negro / Cyan', hex: '#0f172a' },
      { id: 'pack-mixto', name: 'Pack Gris Mixto', hex: '#64748b' },
    ],
    tags: ['Bestseller', 'Eco-Dry'],
    rating: 4.9,
    reviewsCount: 141,
    fitLabel: 'Compresión de Arco Plantar',
  },
];
