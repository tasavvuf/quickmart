const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user.model');
const Store = require('./models/Store.model');
const Product = require('./models/Product.model');

dotenv.config({ path: require('path').resolve(__dirname, '.env') });

const users = [
  {
    userName: 'store_owner_1',
    name: 'Fresh Mart Owner',
    phoneNumber: '9876543210',
    email: 'owner1@example.com',
    password: 'password123',
    role: 'vendor',
    location: { lat: 22.2904, lng: 70.7915 },
    address: 'Adajan, Surat, Gujarat'
  },
  {
    userName: 'store_owner_2',
    name: 'Tech Hub Owner',
    phoneNumber: '9876543220',
    email: 'owner2@example.com',
    password: 'password123',
    role: 'vendor',
    location: { lat: 22.2920, lng: 70.7900 },
    address: 'Athwa, Surat, Gujarat'
  },
  {
    userName: 'customer_1',
    name: 'Customer One',
    phoneNumber: '9876543230',
    email: 'customer1@example.com',
    password: 'password123',
    role: 'user',
    location: { lat: 22.2910, lng: 70.7920 },
    address: 'Pal, Surat, Gujarat'
  },
  {
    userName: 'admin',
    name: 'Admin User',
    phoneNumber: '9876543240',
    email: 'tev.musix@gmail.com',
    password: 'admin',
    role: 'admin',
    location: { lat: 22.2904, lng: 70.7915 },
    address: 'Surat, Gujarat, India'
  },
  {
    userName: 'customer_2',
    name: 'Tasavvufhusen Gori',
    phoneNumber: '8469191292',
    email: 'tasavvufg@gmail.com',
    password: 'test',
    role: 'user',
    location: { lat: 22.2910, lng: 70.7920 },
    address: 'Surat, Gujarat, India'
  }
];

const stores = [
  {
    name: 'Fresh Mart',
    description: 'Daily groceries and fresh produce',
    logo: 'https://via.placeholder.com/150?text=Fresh+Mart',
    banner: 'https://via.placeholder.com/600x200?text=Fresh+Mart+Banner',
    category: 'Grocery',
    location: {
      lat: 22.2904,
      lng: 70.7915,
      address: 'Adajan, Surat, Gujarat 395009',
      city: 'Surat',
      state: 'Gujarat',
      pincode: '395009'
    },
    address: {
      street: 'Fresh Mart Street',
      area: 'Adajan',
      pincode: '395009',
      city: 'Surat',
      state: 'Gujarat',
      landmark: 'Near Adajan Circle'
    },
    gstNumber: '',
    emergencyContact: '9876543211',
    isVerifiedByAdmin: true,
    rating: 4.7,
    isOpen: true
  },
  {
    name: 'Tech Hub',
    description: 'Electronics and accessories',
    logo: 'https://via.placeholder.com/150?text=Tech+Hub',
    banner: 'https://via.placeholder.com/600x200?text=Tech+Hub+Banner',
    category: 'Electronics',
    location: {
      lat: 22.2920,
      lng: 70.7900,
      address: 'Athwa, Surat, Gujarat 395001',
      city: 'Surat',
      state: 'Gujarat',
      pincode: '395001'
    },
    address: {
      street: 'Tech Hub Street',
      area: 'Athwa',
      pincode: '395001',
      city: 'Surat',
      state: 'Gujarat',
      landmark: 'Near Athwa Gate'
    },
    gstNumber: '',
    emergencyContact: '9876543221',
    isVerifiedByAdmin: true,
    rating: 4.5,
    isOpen: true
  }
];

const products = [
  {
    name: 'Organic Apples',
    description: 'Fresh organic apples from local farms.',
    price: 120,
    stock: 30,
    images: ['https://via.placeholder.com/400?text=Organic+Apples'],
    category: 'Fruits',
    featured: true,
    status: 'available'
  },
  {
    name: 'Whole Wheat Bread',
    description: 'Healthy whole wheat bread baked daily.',
    price: 40,
    stock: 50,
    images: ['https://via.placeholder.com/400?text=Whole+Wheat+Bread'],
    category: 'Bakery',
    featured: false,
    status: 'available'
  },
  {
    name: 'Wireless Earbuds',
    description: 'Noise-canceling wireless earbuds with long battery life.',
    price: 1800,
    stock: 20,
    images: ['https://via.placeholder.com/400?text=Wireless+Earbuds'],
    category: 'Electronics',
    featured: true,
    status: 'available'
  },
  {
    name: 'Portable Charger',
    description: 'High-capacity portable charger for phone and tablet.',
    price: 999,
    stock: 35,
    images: ['https://via.placeholder.com/400?text=Portable+Charger'],
    category: 'Accessories',
    featured: false,
    status: 'available'
  }
];

async function seed() {
  try {
    const dbUri = process.env.DB_URI || process.env.MONGODB_URI;
    if (!dbUri) throw new Error('DB_URI or MONGODB_URI is required in .env');

    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Store.deleteMany({});
    await Product.deleteMany({});

    const createdUsers = await User.insertMany(users);
    console.log('Seeded users');

    const createdStores = await Promise.all([
      Store.create({ ...stores[0], owner: createdUsers[0]._id }),
      Store.create({ ...stores[1], owner: createdUsers[1]._id })
    ]);
    console.log('Seeded stores');

    await Product.create({ ...products[0], store: createdStores[0]._id });
    await Product.create({ ...products[1], store: createdStores[0]._id });
    await Product.create({ ...products[2], store: createdStores[1]._id });
    await Product.create({ ...products[3], store: createdStores[1]._id });
    console.log('Seeded products');

    console.log('Database seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
