const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user.model');
const Store = require('./models/Store.model');
const Product = require('./models/Product.model');

dotenv.config({ path: require('path').resolve(__dirname, '.env') });

const inputStoresData = [
  {
    "store_name": "Pick N Pack",
    "address": {
      "street": "Sardar Nagar Main Rd",
      "area": "Sardarnagar",
      "pincode": "360001",
      "city": "Rajkot",
      "state": "Gujarat",
      "landmark": "Near Poojara Telecom"
    },
    "location": [70.7963, 22.2842],
    "contact": {
      "phone_number": null
    },
    "product_details": {
      "categories": ["Groceries", "Packaged Foods", "Daily Essentials", "Snacks"]
    }
  },
  {
    "store_name": "SATYAM MART",
    "address": {
      "street": "Street No. 6",
      "area": "Royal Park",
      "pincode": "360005",
      "city": "Rajkot",
      "state": "Gujarat",
      "landmark": ""
    },
    "location": [70.7674, 22.2881],
    "contact": {
      "phone_number": null
    },
    "product_details": {
      "categories": ["Supermarket Items", "Household Goods", "Groceries", "Personal Care"]
    }
  },
  {
    "store_name": "CHANDAN SUPER MARKET",
    "address": {
      "street": "Amin Marg",
      "area": "Nalanda Society",
      "pincode": "360001",
      "city": "Rajkot",
      "state": "Gujarat",
      "landmark": "Trisha Complex"
    },
    "location": [70.7766, 22.2831],
    "contact": {
      "phone_number": "+91 98986 26624"
    },
    "product_details": {
      "categories": ["Spices & Pulses", "Packaged Snacks", "Beverages", "Daily Groceries"]
    }
  },
  {
    "store_name": "Tera Mart",
    "address": {
      "street": "Amin Marg",
      "area": "Kotecha Nagar",
      "pincode": "360002",
      "city": "Rajkot",
      "state": "Gujarat",
      "landmark": "Near Track Side Tadka"
    },
    "location": [70.7832, 22.2853],
    "contact": {
      "phone_number": "+91 99788 08612"
    },
    "product_details": {
      "categories": ["Organic Foods", "Groceries", "Dairy Products", "Confectionery"]
    }
  },
  {
    "store_name": "Kasturi Supermarket",
    "address": {
      "street": "Akshar Marg",
      "area": "Kotecha Nagar",
      "pincode": "360001",
      "city": "Rajkot",
      "state": "Gujarat",
      "landmark": ""
    },
    "location": [70.7841, 22.2839],
    "contact": {
      "phone_number": "+91 88660 01195"
    },
    "product_details": {
      "categories": ["Grains & Flour", "Household Cleaners", "Personal Care", "Dairy & Snacks"]
    }
  }
];

// Product generator catalog based on categories
const productCatalogByCategory = {
  "Groceries": [
    { name: "Basmati Rice 5kg", description: "Premium long-grain fragrant basmati rice.", price: 450, stock: 40 },
    { name: "Sugar 1kg", description: "Refined pure white sugar.", price: 45, stock: 100 },
    { name: "Toor Dal 1kg", description: "Unpolished nutritious yellow toor dal.", price: 160, stock: 50 },
    { name: "Sunflower Oil 1L", description: "Healthy cooking sunflower oil pouch.", price: 135, stock: 60 }
  ],
  "Packaged Foods": [
    { name: "Instant Noodles 4-Pack", description: "Delicious masala instant noodles.", price: 56, stock: 80 },
    { name: "Tomato Ketchup 500g", description: "Tangy rich tomato ketchup bottle.", price: 95, stock: 45 },
    { name: "Oats 1kg", description: "100% natural rolled oats for healthy breakfast.", price: 190, stock: 35 }
  ],
  "Daily Essentials": [
    { name: "Cow Milk 1L", description: "Fresh pasteurized whole cow milk.", price: 64, stock: 50 },
    { name: "Salt 1kg", description: "Iodized crystal refined salt.", price: 28, stock: 120 },
    { name: "Matchbox Pack of 10", description: "Safety matches bundle.", price: 20, stock: 200 }
  ],
  "Snacks": [
    { name: "Potato Chips Masala 100g", description: "Crispy crunchy spicy potato chips.", price: 30, stock: 75 },
    { name: "Salted Peanuts 200g", description: "Freshly roasted salted peanuts.", price: 60, stock: 50 },
    { name: "Chocolate Biscuit Pack", description: "Rich cocoa cream sandwich biscuits.", price: 40, stock: 90 }
  ],
  "Supermarket Items": [
    { name: "Green Tea 25 Bags", description: "Antioxidant-rich organic green tea bags.", price: 180, stock: 30 },
    { name: "Honey 250g", description: "Pure wild forest organic honey.", price: 150, stock: 40 }
  ],
  "Household Goods": [
    { name: "Dishwash Gel 500ml", description: "Lemon infused grease-removing dishwash liquid.", price: 110, stock: 40 },
    { name: "Detergent Powder 1kg", description: "Stain removing fabric detergent.", price: 140, stock: 60 },
    { name: "Floor Cleaner 1L", description: "Disinfectant surface and floor cleaner.", price: 175, stock: 50 }
  ],
  "Personal Care": [
    { name: "Bathing Soap Pack of 4", description: "Moisturizing skin bathing soap.", price: 160, stock: 50 },
    { name: "Shampoo 180ml", description: "Nourishing anti-dandruff shampoo.", price: 135, stock: 45 },
    { name: "Toothpaste 150g", description: "Complete care mint herbal toothpaste.", price: 90, stock: 80 }
  ],
  "Spices & Pulses": [
    { name: "Red Chilli Powder 200g", description: "Pure vibrant spicy red chilli powder.", price: 85, stock: 55 },
    { name: "Turmeric Powder 200g", description: "High-curcumin ground turmeric powder.", price: 65, stock: 60 },
    { name: "Chana Dal 1kg", description: "Clean unpolished chana dal.", price: 110, stock: 50 }
  ],
  "Packaged Snacks": [
    { name: "Banana Chips 200g", description: "Traditional crunchy salted banana chips.", price: 70, stock: 40 },
    { name: "Bhujia Sev 400g", description: "Spicy crisp gram flour bhujia.", price: 115, stock: 65 }
  ],
  "Beverages": [
    { name: "Mango Juice 1L", description: "Refreshing delicious Alphonso mango pulp drink.", price: 85, stock: 40 },
    { name: "Cold Drink Cola 1.25L", description: "Carbonated refreshing cola beverage.", price: 65, stock: 70 }
  ],
  "Daily Groceries": [
    { name: "Wheat Flour (Atta) 5kg", description: "100% whole wheat chakki fresh atta.", price: 230, stock: 45 },
    { name: "Mustard Oil 1L", description: "Kachi ghani cold pressed mustard oil.", price: 165, stock: 35 }
  ],
  "Organic Foods": [
    { name: "Organic Jaggery 1kg", description: "Unrefined natural cane sugar jaggery powder.", price: 95, stock: 40 },
    { name: "Organic Quinoa 500g", description: "Protein-rich white organic quinoa grains.", price: 220, stock: 25 }
  ],
  "Dairy Products": [
    { name: "Fresh Paneer 200g", description: "Soft fresh cottage cheese paneer block.", price: 90, stock: 30 },
    { name: "Pure Cow Ghee 500ml", description: "Traditional aromatic pure cow ghee jar.", price: 340, stock: 35 },
    { name: "Butter 100g", description: "Salted creamy dairy butter.", price: 58, stock: 60 }
  ],
  "Confectionery": [
    { name: "Dark Chocolate Bar 80g", description: "70% Cocoa premium dark chocolate bar.", price: 120, stock: 40 },
    { name: "Assorted Candies Pack", description: "Fruit flavored sweet boiled candies.", price: 50, stock: 100 }
  ],
  "Grains & Flour": [
    { name: "Multigrain Atta 5kg", description: "High fiber multigrain flour mix.", price: 260, stock: 30 },
    { name: "Poha (Flattened Rice) 1kg", description: "Thick clean poha for breakfast.", price: 65, stock: 50 }
  ],
  "Household Cleaners": [
    { name: "Glass Cleaner Spray 500ml", description: "Streak-free shine glass & window cleaner.", price: 105, stock: 35 },
    { name: "Toilet Cleaner 500ml", description: "Disinfectant deep cleaning toilet gel.", price: 92, stock: 50 }
  ],
  "Dairy & Snacks": [
    { name: "Flavored Yogurt 100g", description: "Strawberry flavored fresh probiotic curd.", price: 35, stock: 45 },
    { name: "Cheese Slices 200g", description: "Processed creamy cheese slices pack.", price: 140, stock: 40 }
  ]
};

async function seed() {
  try {
    const dbUri = process.env.DB_URI || process.env.MONGODB_URI;
    if (!dbUri) throw new Error('DB_URI or MONGODB_URI is required in .env');

    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB');

    // Clean existing collection data
    await User.deleteMany({});
    await Store.deleteMany({});
    await Product.deleteMany({});

    console.log('Cleared existing User, Store, and Product collections.');

    // 1. Create Owners & Users (User model)
    const ownersToCreate = inputStoresData.map((item, index) => {
      const idx = index + 1;
      const cleanPhone = item.contact && item.contact.phone_number 
        ? item.contact.phone_number.replace(/\D/g, '').slice(-10) 
        : `987654320${idx}`;
      
      const emailUsername = item.store_name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const fullAddr = `${item.address.street}, ${item.address.area}, ${item.address.city}, ${item.address.state} - ${item.address.pincode}`;
      const addrId = new mongoose.Types.ObjectId();

      return {
        userName: `${emailUsername}_owner`,
        name: `${item.store_name} Owner`,
        phoneNumber: cleanPhone,
        email: `${emailUsername}@store.com`,
        password: 'password123',
        role: 'vendor',
        location: {
          type: 'Point',
          coordinates: item.location
        },
        address: fullAddr,
        addresses: [
          {
            _id: addrId,
            label: "Store Address",
            fullAddress: fullAddr,
            street: item.address.street,
            area: item.address.area,
            city: item.address.city,
            state: item.address.state,
            pincode: item.address.pincode,
            location: {
              type: "Point",
              coordinates: item.location
            },
            isDefault: true
          }
        ],
        selectedAddressId: String(addrId),
        profilePhoto: {
          url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${emailUsername}`,
          fileId: '',
          name: `${item.store_name} Owner Avatar`,
          thumbnailUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${emailUsername}`
        }
      };
    });

    // Seed default admin user
    const adminAddrId = new mongoose.Types.ObjectId();
    ownersToCreate.push({
      userName: 'admin',
      name: 'Admin User',
      phoneNumber: '9876543299',
      email: 'admin@ecom.com',
      password: 'adminpassword',
      role: 'admin',
      location: { type: 'Point', coordinates: [70.7963, 22.2842] },
      address: 'Rajkot, Gujarat, India',
      addresses: [
        {
          _id: adminAddrId,
          label: 'Main Office',
          fullAddress: 'Rajkot, Gujarat, India',
          street: 'Amin Marg',
          area: 'Central',
          city: 'Rajkot',
          state: 'Gujarat',
          pincode: '360001',
          location: { type: 'Point', coordinates: [70.7963, 22.2842] },
          isDefault: true
        }
      ],
      selectedAddressId: String(adminAddrId),
      profilePhoto: { url: '', fileId: '', name: '', thumbnailUrl: '' }
    });

    // Seed user 'tasavvuf'
    const tasavvufAddrId = new mongoose.Types.ObjectId();
    ownersToCreate.push({
      _id: new mongoose.Types.ObjectId('6a71aa365c655cf0e77a3c71'),
      userName: 'tasavvuf',
      name: 'Tasavvufhusen Imdadhusen Gori',
      phoneNumber: '08469191292',
      email: 'tasavvufg@gmail.com',
      password: 'test',
      role: 'user',
      location: {
        type: 'Point',
        coordinates: [70.7915, 22.2904]
      },
      address: 'Afiya 1 , 2nd floor , flat no 204',
      addresses: [
        {
          _id: tasavvufAddrId,
          label: 'Home',
          fullAddress: 'Afiya 1 , 2nd floor , flat no 204, Surat, Gujarat',
          street: 'Afiya 1 , 2nd floor , flat no 204',
          area: 'Vesu',
          city: 'Surat',
          state: 'Gujarat',
          pincode: '395007',
          location: {
            type: 'Point',
            coordinates: [70.7915, 22.2904]
          },
          isDefault: true
        }
      ],
      selectedAddressId: String(tasavvufAddrId),
      profilePhoto: {
        url: '',
        fileId: '',
        name: '',
        thumbnailUrl: ''
      },
      createdAt: new Date('2026-08-04T09:00:38.863Z'),
      updatedAt: new Date('2026-08-04T09:00:38.863Z')
    });

    // Seed Delivery Partners
    const emptyDoc = { url: '', fileId: '', name: '', thumbnailUrl: '' };

    const rahulAddrId = new mongoose.Types.ObjectId();
    ownersToCreate.push({
      userName: 'rahul_rider',
      name: 'Rahul Sharma',
      phoneNumber: '9876543201',
      email: 'rahul@delivery.com',
      password: 'test',
      role: 'deliveryPartner',
      location: { type: 'Point', coordinates: [70.7920, 22.2860] },
      address: 'Sardarnagar, Rajkot, Gujarat',
      addresses: [
        {
          _id: rahulAddrId,
          label: 'Home',
          fullAddress: 'Sardarnagar, Rajkot, Gujarat',
          street: 'Sardarnagar Main Rd',
          area: 'Sardarnagar',
          city: 'Rajkot',
          state: 'Gujarat',
          pincode: '360001',
          location: { type: 'Point', coordinates: [70.7920, 22.2860] },
          isDefault: true
        }
      ],
      selectedAddressId: String(rahulAddrId),
      profilePhoto: {
        url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahulrider',
        fileId: '', name: 'Rahul Avatar',
        thumbnailUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahulrider'
      },
      deliveryPartnerProfile: {
        dateOfBirth: '1998-03-15',
        emergencyContactName: 'Suresh Sharma',
        emergencyContactNumber: '9876543100',
        currentAddress: {
          street: 'Sardarnagar Main Rd', area: 'Sardarnagar',
          pincode: '360001', city: 'Rajkot', state: 'Gujarat', landmark: 'Near Poojara Telecom'
        },
        vehicleType: 'Motorcycle',
        vehicleNumber: 'GJ-03-AB-1234',
        drivingLicenseNumber: 'GJ0320220001234',
        vehicleModel: 'Honda Activa 6G',
        insuranceNumber: 'INS-2026-001234',
        documents: {
          drivingLicense: emptyDoc, vehicleRC: emptyDoc,
          vehicleInsurance: emptyDoc, aadhaarCard: emptyDoc,
          panCard: emptyDoc, profilePhoto: emptyDoc,
        },
        isVerified: true,
        isAvailable: true,
        currentOrderId: null,
      }
    });

    const amitAddrId = new mongoose.Types.ObjectId();
    ownersToCreate.push({
      userName: 'amit_driver',
      name: 'Amit Patel',
      phoneNumber: '9876543202',
      email: 'amit@delivery.com',
      password: 'test',
      role: 'deliveryPartner',
      location: { type: 'Point', coordinates: [70.7780, 22.2840] },
      address: 'Kotecha Nagar, Rajkot, Gujarat',
      addresses: [
        {
          _id: amitAddrId,
          label: 'Home',
          fullAddress: 'Kotecha Nagar, Rajkot, Gujarat',
          street: 'Amin Marg',
          area: 'Kotecha Nagar',
          city: 'Rajkot',
          state: 'Gujarat',
          pincode: '360002',
          location: { type: 'Point', coordinates: [70.7780, 22.2840] },
          isDefault: true
        }
      ],
      selectedAddressId: String(amitAddrId),
      profilePhoto: {
        url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amitdriver',
        fileId: '', name: 'Amit Avatar',
        thumbnailUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amitdriver'
      },
      deliveryPartnerProfile: {
        dateOfBirth: '1996-07-22',
        emergencyContactName: 'Rajesh Patel',
        emergencyContactNumber: '9876543200',
        currentAddress: {
          street: 'Amin Marg', area: 'Kotecha Nagar',
          pincode: '360002', city: 'Rajkot', state: 'Gujarat', landmark: 'Near Track Side Tadka'
        },
        vehicleType: 'Scooter',
        vehicleNumber: 'GJ-03-CD-5678',
        drivingLicenseNumber: 'GJ0320220005678',
        vehicleModel: 'TVS Jupiter',
        insuranceNumber: 'INS-2026-005678',
        documents: {
          drivingLicense: emptyDoc, vehicleRC: emptyDoc,
          vehicleInsurance: emptyDoc, aadhaarCard: emptyDoc,
          panCard: emptyDoc, profilePhoto: emptyDoc,
        },
        isVerified: true,
        isAvailable: true,
        currentOrderId: null,
      }
    });

    const createdUsers = await User.insertMany(ownersToCreate);
    console.log(`Successfully created ${createdUsers.length} Users (Owners, Admin & Delivery Partners).`);

    // 2. Create Stores matching Store model strict schema
    const storesToCreate = inputStoresData.map((item, index) => {
      const ownerUser = createdUsers[index];
      const primaryCategory = item.product_details.categories[0] || 'General';
      const cleanPhone = item.contact && item.contact.phone_number 
        ? item.contact.phone_number 
        : '+91 987654320' + (index + 1);

      return {
        owner: ownerUser._id,
        name: item.store_name,
        description: `Welcome to ${item.store_name}! We provide quality ${item.product_details.categories.join(', ')}.`,
        logo: `https://via.placeholder.com/150?text=${encodeURIComponent(item.store_name)}`,
        banner: `https://via.placeholder.com/600x200?text=${encodeURIComponent(item.store_name + ' Banner')}`,
        storePhoto: {
          url: `https://via.placeholder.com/600x400?text=${encodeURIComponent(item.store_name)}`,
          fileId: '',
          name: `${item.store_name} Photo`,
          thumbnailUrl: `https://via.placeholder.com/150?text=${encodeURIComponent(item.store_name)}`
        },
        category: primaryCategory,
        location: {
          type: 'Point',
          coordinates: item.location
        },
        address: {
          street: item.address.street,
          area: item.address.area,
          pincode: item.address.pincode,
          city: item.address.city,
          state: item.address.state,
          landmark: item.address.landmark || ''
        },
        gstNumber: `24AAAAA0000A1Z${index + 1}`,
        emergencyContact: cleanPhone,
        isVerifiedByAdmin: true,
        rating: +(4.0 + (index * 0.2)).toFixed(1),
        isOpen: true
      };
    });

    const createdStores = await Store.insertMany(storesToCreate);
    console.log(`Successfully created ${createdStores.length} Stores.`);

    // 3. Create Products for each store based on their categories
    const productsToCreate = [];

    const categoryImageMap = {
      "Groceries": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80",
      "Packaged Foods": "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&q=80",
      "Daily Essentials": "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&q=80",
      "Snacks": "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=500&q=80",
      "Supermarket Items": "https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=500&q=80",
      "Household Goods": "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500&q=80",
      "Personal Care": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=80",
      "Spices & Pulses": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&q=80",
      "Packaged Snacks": "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500&q=80",
      "Beverages": "https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=500&q=80",
      "Daily Groceries": "https://images.unsplash.com/photo-1543083477-4f785aeafaa9?w=500&q=80",
      "Organic Foods": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&q=80",
      "Dairy Products": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500&q=80",
      "Confectionery": "https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=500&q=80",
      "Grains & Flour": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&q=80",
      "Household Cleaners": "https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?w=500&q=80",
      "Dairy & Snacks": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&q=80"
    };

    createdStores.forEach((storeObj, index) => {
      const rawStoreItem = inputStoresData[index];
      const categories = rawStoreItem.product_details.categories;
      let featuredCount = 0;

      categories.forEach((cat) => {
        const catalogProducts = productCatalogByCategory[cat] || [
          { name: `${cat} Item 1`, description: `Fresh high-quality ${cat}`, price: 100, stock: 50 },
          { name: `${cat} Item 2`, description: `Popular selling ${cat}`, price: 150, stock: 40 }
        ];

        catalogProducts.forEach((p) => {
          const catImg = categoryImageMap[cat] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80";
          const isFeatured = featuredCount < 3;
          if (isFeatured) {
            featuredCount++;
          }

          productsToCreate.push({
            store: storeObj._id,
            name: `${p.name} (${storeObj.name.split(' ')[0]})`,
            description: p.description,
            price: p.price,
            stock: Math.max(p.stock, 25),
            images: [catImg],
            category: cat,
            featured: isFeatured,
            status: 'active'
          });
        });
      });
    });

    const createdProducts = await Product.insertMany(productsToCreate);
    console.log(`Successfully created ${createdProducts.length} Products across all stores.`);

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed with error:', error);
    process.exit(1);
  }
}

seed();
