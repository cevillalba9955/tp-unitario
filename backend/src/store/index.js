const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

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
];

seedUsers.forEach(({ id, email, password, role }) => {
  store.users.set(email, { id, email, passwordHash: sha256(password), role });
});

module.exports = store;
