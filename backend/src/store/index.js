const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const zlib = require('zlib');

const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');

const store = {
  categories: new Map(),
  services: new Map(),
  packages: new Map(),
  images: new Map(),
  users: new Map(),
};

const seedCategories = [
  { name: 'Desarrollo', slug: 'development' },
  { name: 'Diseño', slug: 'design' },
  { name: 'Redacción', slug: 'writing' },
  { name: 'Marketing', slug: 'marketing' },
  { name: 'Video', slug: 'video' },
  { name: 'Música', slug: 'music' },
  { name: 'Programación', slug: 'programming' },
  { name: 'Negocios', slug: 'business' },
];

seedCategories.forEach((cat) => {
  const id = uuidv4();
  store.categories.set(id, { id, name: cat.name, slug: cat.slug });
});

const seedUsers = [
  { id: 'user-demo-001', email: 'freelancer@demo.com', password: 'demo1234', role: 'freelancer' },
  { id: 'user-demo-002', email: 'buyer@demo.com', password: 'demo1234', role: 'buyer' },
];

seedUsers.forEach(({ id, email, password, role }) => {
  store.users.set(email, { id, email, passwordHash: sha256(password), role });
});

// Genera un PNG de 4×4 px de color sólido (r,g,b). Sin dependencias externas.
function makeSolidPng(r, g, b) {
  const W = 4, H = 4;

  // Scanlines: filtro 0x00 + 4 píxeles RGB por fila
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0; // filter byte
    for (let x = 0; x < W; x++) {
      const i = y * (1 + W * 3) + 1 + x * 3;
      raw[i] = r; raw[i + 1] = g; raw[i + 2] = b;
    }
  }

  const idat = zlib.deflateSync(raw);

  function chunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type, 'ascii');
    const crc = Buffer.alloc(4);
    crc.writeInt32BE(crc32(Buffer.concat([t, data])), 0);
    return Buffer.concat([len, t, data, crc]);
  }

  function crc32(buf) {
    let c = 0xffffffff;
    for (const b of buf) {
      c ^= b;
      for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    return (c ^ 0xffffffff) | 0;
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), // PNG sig
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function categoryIdBySlug(slug) {
  for (const [, cat] of store.categories) {
    if (cat.slug === slug) return cat.id;
  }
  return null;
}

const now = new Date().toISOString();

const seedServices = [
  {
    id: 'svc-demo-001',
    title: 'Diseño de logo profesional',
    description: 'Creamos el logo de tu marca desde cero: bocetos iniciales, paleta de colores y entrega en formatos PNG, SVG y PDF. Hasta 3 revisiones incluidas.',
    categorySlug: 'design',
    packages: [
      { id: 'pkg-demo-001a', name: 'Básico', scope: '1 concepto, 2 revisiones, PNG', price: 5000, deliveryDays: 5, displayOrder: 1 },
      { id: 'pkg-demo-001b', name: 'Pro', scope: '3 conceptos, revisiones ilimitadas, PNG + SVG + PDF', price: 12000, deliveryDays: 10, displayOrder: 2 },
    ],
    image: { id: 'img-demo-001', color: [108, 92, 231], mimeType: 'image/png' }, // violeta
  },
  {
    id: 'svc-demo-002',
    title: 'Desarrollo de landing page',
    description: 'Landing page responsive con HTML, CSS y JS puro. Optimizada para conversión: sección hero, beneficios, llamada a la acción y formulario de contacto.',
    categorySlug: 'development',
    packages: [
      { id: 'pkg-demo-002a', name: 'Starter', scope: '1 sección + formulario de contacto', price: 8000, deliveryDays: 7, displayOrder: 1 },
      { id: 'pkg-demo-002b', name: 'Completa', scope: '5 secciones + SEO básico + formulario', price: 20000, deliveryDays: 14, displayOrder: 2 },
      { id: 'pkg-demo-002c', name: 'Premium', scope: '5 secciones + SEO + analytics + hosting 1 año', price: 35000, deliveryDays: 21, displayOrder: 3 },
    ],
    image: { id: 'img-demo-002', color: [0, 184, 148], mimeType: 'image/png' }, // verde
  },
  {
    id: 'svc-demo-003',
    title: 'Redacción de contenido SEO',
    description: 'Artículos de blog optimizados para buscadores. Investigación de palabras clave, estructura H1/H2/H3, meta descripción y texto natural sin relleno.',
    categorySlug: 'writing',
    packages: [
      { id: 'pkg-demo-003a', name: 'Artículo corto', scope: '600–800 palabras, 1 revisión', price: 2500, deliveryDays: 3, displayOrder: 1 },
      { id: 'pkg-demo-003b', name: 'Artículo largo', scope: '1500–2000 palabras, 2 revisiones, meta desc', price: 6000, deliveryDays: 5, displayOrder: 2 },
    ],
    image: { id: 'img-demo-003', color: [253, 150, 68], mimeType: 'image/png' }, // naranja
  },
  {
    id: 'svc-demo-004',
    title: 'Gestión de redes sociales',
    description: 'Administración mensual de Instagram y Facebook: calendario editorial, diseño de posts, copywriting y reporte de métricas. Ideal para PyMEs.',
    categorySlug: 'marketing',
    packages: [
      { id: 'pkg-demo-004a', name: 'Básico', scope: '8 posts/mes, 1 red social', price: 15000, deliveryDays: 30, displayOrder: 1 },
      { id: 'pkg-demo-004b', name: 'Crecimiento', scope: '16 posts/mes, 2 redes + stories + reporte', price: 28000, deliveryDays: 30, displayOrder: 2 },
    ],
    image: { id: 'img-demo-004', color: [232, 67, 147], mimeType: 'image/png' }, // rosa
  },
];

seedServices.forEach(({ id, title, description, categorySlug, packages, image }) => {
  const categoryId = categoryIdBySlug(categorySlug);
  const service = { id, title, description, categoryId, status: 'PUBLISHED', freelancerId: 'user-demo-001', createdAt: now, updatedAt: now };
  store.services.set(id, service);

  packages.forEach((pkg) => store.packages.set(pkg.id, { ...pkg, serviceId: id }));

  const imgBuffer = makeSolidPng(...image.color);
  store.images.set(image.id, { id: image.id, serviceId: id, mimeType: image.mimeType, imageBuffer: imgBuffer, displayOrder: 1 });
});

module.exports = store;
