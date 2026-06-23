const { v4: uuidv4 } = require('uuid');

const store = {
  categories: new Map(),
  services: new Map(),
  packages: new Map(),
  images: new Map(),
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

module.exports = store;
