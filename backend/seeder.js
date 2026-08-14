const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/user.model");
const Store = require("./models/Store.model");
const Product = require("./models/Product.model");

dotenv.config({ path: require("path").resolve(__dirname, ".env") });

const inputStoresData = [
  // ─── RAJKOT STORES ───
  {
    store_name: "Pick N Pack",
    address: {
      street: "Sardar Nagar Main Rd",
      area: "Sardarnagar",
      pincode: "360001",
      city: "Rajkot",
      state: "Gujarat",
      landmark: "Near Poojara Telecom",
    },
    location: [70.7963, 22.2842],
    contact: {
      phone_number: "+91 98765 43001",
    },
    product_details: {
      categories: ["Groceries", "Packaged Foods", "Daily Essentials", "Snacks"],
    },
  },
  {
    store_name: "SATYAM MART",
    address: {
      street: "Street No. 6",
      area: "Royal Park",
      pincode: "360005",
      city: "Rajkot",
      state: "Gujarat",
      landmark: "",
    },
    location: [70.7674, 22.2881],
    contact: {
      phone_number: "+91 98765 43002",
    },
    product_details: {
      categories: [
        "Supermarket Items",
        "Household Goods",
        "Groceries",
        "Personal Care",
      ],
    },
  },
  {
    store_name: "CHANDAN SUPER MARKET",
    address: {
      street: "Amin Marg",
      area: "Nalanda Society",
      pincode: "360001",
      city: "Rajkot",
      state: "Gujarat",
      landmark: "Trisha Complex",
    },
    location: [70.7766, 22.2831],
    contact: {
      phone_number: "+91 98986 26624",
    },
    product_details: {
      categories: [
        "Spices & Pulses",
        "Packaged Snacks",
        "Beverages",
        "Daily Groceries",
      ],
    },
  },
  {
    store_name: "Tera Mart",
    address: {
      street: "Amin Marg",
      area: "Kotecha Nagar",
      pincode: "360002",
      city: "Rajkot",
      state: "Gujarat",
      landmark: "Near Track Side Tadka",
    },
    location: [70.7832, 22.2853],
    contact: {
      phone_number: "+91 99788 08612",
    },
    product_details: {
      categories: [
        "Organic Foods",
        "Groceries",
        "Dairy Products",
        "Confectionery",
      ],
    },
  },
  {
    store_name: "Kasturi Supermarket",
    address: {
      street: "Akshar Marg",
      area: "Kotecha Nagar",
      pincode: "360001",
      city: "Rajkot",
      state: "Gujarat",
      landmark: "",
    },
    location: [70.7841, 22.2839],
    contact: {
      phone_number: "+91 88660 01195",
    },
    product_details: {
      categories: [
        "Grains & Flour",
        "Household Cleaners",
        "Personal Care",
        "Dairy & Snacks",
      ],
    },
  },

  // ─── BHAVNAGAR STORES (10km radius of Talawdi Chawk, Vadva, Bhavnagar) ───
  {
    store_name: "MODI SHOW ROOM - Best men's fabric shop in bhavnagar",
    address: {
      street: "Shelarsha Chowk, Near Dargha",
      area: "Vadva",
      pincode: "364001",
      city: "Bhavnagar",
      state: "Gujarat",
      landmark: "Near Dargha",
    },
    location: [72.1385, 21.7828],
    contact: {
      phone_number: "+91 98765 43011",
    },
    product_details: {
      categories: ["Clothing Store", "Men's Apparel", "Fabric Store"],
    },
    custom_products: [
      {
        name: "Cotton Shirt Fabric",
        description:
          "Premium 100% breathable unstitched cotton shirt fabric per meter.",
        price: 450,
        stock: 50,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&q=80",
      },
      {
        name: "Suiting Material",
        description:
          "High-grade luxury suiting fabric for tuxedos & blazers per meter.",
        price: 1200,
        stock: 35,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&q=80",
      },
      {
        name: "Unstitched Kurta Fabric",
        description: "Traditional unstitched men's ethnic kurta fabric set.",
        price: 600,
        stock: 40,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80",
      },
    ],
  },
  {
    store_name: "All In One - Supermarket",
    address: {
      street: "Harris Road, Near Hotel Vrindavan",
      area: "Amba Chowk, Darbargadh",
      pincode: "364001",
      city: "Bhavnagar",
      state: "Gujarat",
      landmark: "Near Hotel Vrindavan",
    },
    location: [72.145, 21.7895],
    contact: {
      phone_number: "+91 98765 43012",
    },
    product_details: {
      categories: ["Supermarket", "Grocery Store", "Department Store"],
    },
    custom_products: [
      {
        name: "Basmati Rice 5kg",
        description: "Aromatic long-grain basmati rice 5kg pack.",
        price: 450,
        stock: 60,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80",
      },
      {
        name: "Sunflower Oil 1L",
        description: "Refined healthy cooking sunflower oil 1L pouch.",
        price: 140,
        stock: 70,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80",
      },
      {
        name: "Assorted Snack Pack",
        description:
          "Combo pack of crispy traditional Bhavnagari farsan & snacks.",
        price: 99,
        stock: 90,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=500&q=80",
      },
    ],
  },
  {
    store_name: "Reliance SMART Bazaar",
    address: {
      street: "Ground Flr & 1st Flr, Shiva Blessing, CS No 208/415",
      area: "Nawa Para",
      pincode: "364001",
      city: "Bhavnagar",
      state: "Gujarat",
      landmark: "Opposite BMC",
    },
    location: [72.1481, 21.785],
    contact: {
      phone_number: "+91 98765 43013",
    },
    product_details: {
      categories: ["Hypermarket", "Supermarket", "Electronics", "Groceries"],
    },
    custom_products: [
      {
        name: "Whole Wheat Atta 10kg",
        description: "Chakki fresh 100% whole wheat flour 10kg.",
        price: 380,
        stock: 50,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&q=80",
      },
      {
        name: "Stainless Steel Cookware Set",
        description:
          "Heavy gauge 5-piece stainless steel kitchen cookware set.",
        price: 1299,
        stock: 25,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500&q=80",
      },
      {
        name: "Detergent Powder 4kg",
        description:
          "Advanced stain removing laundry detergent powder 4kg economy pack.",
        price: 499,
        stock: 45,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500&q=80",
      },
    ],
  },
  {
    store_name: "Deodap Wholesale Mall",
    address: {
      street: "105, Shiva Blessing 2",
      area: "Nawa Para",
      pincode: "364001",
      city: "Bhavnagar",
      state: "Gujarat",
      landmark: "Near Collectorate Building",
    },
    location: [72.1478, 21.7845],
    contact: {
      phone_number: "+91 98765 43014",
    },
    product_details: {
      categories: [
        "Wholesale Store",
        "Household Goods",
        "Kitchenware",
        "Gadgets",
      ],
    },
    custom_products: [
      {
        name: "Mini Vegetable Chopper",
        description:
          "Handy quick manual vegetable and fruit chopper with stainless blades.",
        price: 199,
        stock: 80,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1590794056226-77ef3a6c4743?w=500&q=80",
      },
      {
        name: "Rechargeable LED Desk Lamp",
        description: "Touch-control eye care dimmable LED study desk lamp.",
        price: 349,
        stock: 40,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=500&q=80",
      },
      {
        name: "Organizer Storage Box",
        description: "Multi-purpose foldable fabric wardrobe organizer box.",
        price: 149,
        stock: 65,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=500&q=80",
      },
    ],
  },
  {
    store_name: "Mahadev Provisan Store",
    address: {
      street: "Chitra - Sidsar Rd, Sahyog Society",
      area: "Chitra",
      pincode: "364004",
      city: "Bhavnagar",
      state: "Gujarat",
      landmark: "Sahyog Society",
    },
    location: [72.122, 21.771],
    contact: {
      phone_number: "+91 98765 43015",
    },
    product_details: {
      categories: ["Grocery Store", "Provision Store", "General Store"],
    },
    custom_products: [
      {
        name: "Fresh Milk 1L",
        description: "Pure pasteurized fresh full cream milk 1L.",
        price: 60,
        stock: 100,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&q=80",
      },
      {
        name: "Toor Dal 1kg",
        description: "Unpolished high protein yellow toor dal 1kg.",
        price: 160,
        stock: 55,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80",
      },
      {
        name: "Tea Powder 500g",
        description: "Strong aromatic CTC Assam chai tea powder 500g.",
        price: 240,
        stock: 45,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=500&q=80",
      },
    ],
  },
  {
    store_name: "Sadguru Book Stall",
    address: {
      street: "Vartej Main Road",
      area: "Vartej",
      pincode: "364060",
      city: "Bhavnagar",
      state: "Gujarat",
      landmark: "Vartej Main Road",
    },
    location: [72.0722, 21.7371],
    contact: {
      phone_number: "+91 97234 34014",
    },
    product_details: {
      categories: ["Book Store", "Stationery", "Books"],
    },
    custom_products: [
      {
        name: "Classmate Long Notebook (A4 200 Pages)",
        description: "High quality A4 size 200 pages long notebook.",
        price: 85,
        stock: 50,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80",
      },
      {
        name: "Camel Art & Craft Acrylic Colors Set",
        description: "Set of 12 vibrant acrylic colors for art & craft.",
        price: 240,
        stock: 40,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&q=80",
      },
      {
        name: "Parker Vector Stainless Steel Ball Pen",
        description: "Classic stainless steel refillable ballpoint pen.",
        price: 350,
        stock: 30,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&q=80",
      },
      {
        name: "Navneet Geometry Box Set",
        description: "Precision compass & ruler geometry mathematical box.",
        price: 150,
        stock: 45,
        featured: false,
        image:
          "https://images.unsplash.com/photo-1588072432836-e10032774350?w=500&q=80",
      },
      {
        name: "Apsara Platinum Extra Dark Pencils Pack",
        description: "Pack of 10 extra dark writing pencils with eraser.",
        price: 80,
        stock: 100,
        featured: false,
        image:
          "https://images.unsplash.com/photo-1569683795645-b62e50fbf103?w=500&q=80",
      },
    ],
  },
  {
    store_name: "JAY SOMNATH TRADING Co",
    address: {
      street: "Shop No 4, 5, 6, 7, Chitra - Sidsar Rd",
      area: "Pooja Nagar, Chitra",
      pincode: "364004",
      city: "Bhavnagar",
      state: "Gujarat",
      landmark: "Pooja Nagar",
    },
    location: [72.0889, 21.7588],
    contact: {
      phone_number: "+91 98988 16767",
    },
    product_details: {
      categories: ["Grocery Store", "Wholesale Store", "General Supplies"],
    },
    custom_products: [
      {
        name: "Fortune Whole Wheat Atta 10kg Bag",
        description: "100% pure chakki fresh whole wheat flour 10kg.",
        price: 420,
        stock: 60,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&q=80",
      },
      {
        name: "Wagh Bakri Premium Tea 1kg",
        description: "Strong aromatic CTC leaf tea 1kg pack.",
        price: 520,
        stock: 50,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=500&q=80",
      },
      {
        name: "Madhur Pure Sugar 5kg Pack",
        description: "Sulphur-free clean refined white sugar 5kg.",
        price: 230,
        stock: 70,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1581600140682-d4e68c8cde32?w=500&q=80",
      },
      {
        name: "Fortune Sunlite Refined Sunflower Oil 5L Jar",
        description: "Light healthy refined sunflower cooking oil 5L jar.",
        price: 740,
        stock: 40,
        featured: false,
        image:
          "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80",
      },
      {
        name: "Tata Salt Vacuum Evaporated 1kg Pack",
        description: "Iodized crystal salt with essential minerals 1kg.",
        price: 28,
        stock: 120,
        featured: false,
        image:
          "https://images.unsplash.com/photo-1518110165387-a25e985834b6?w=500&q=80",
      },
    ],
  },
  {
    store_name: "Mahadev Provisan Store",
    address: {
      street: "Chitra - Sidsar Rd",
      area: "Sahyog Society, Chitra",
      pincode: "364004",
      city: "Bhavnagar",
      state: "Gujarat",
      landmark: "Sahyog Society",
    },
    location: [72.0895, 21.7582],
    contact: {
      phone_number: "+91 94268 56509",
    },
    product_details: {
      categories: ["Grocery Store", "Daily Essentials", "Grain Provisions"],
    },
    custom_products: [
      {
        name: "Toor Dal Premium Cleaned 1kg",
        description: "Unpolished nutritious yellow toor dal 1kg.",
        price: 160,
        stock: 45,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80",
      },
      {
        name: "Amul Taaza T-Special Fresh Milk 1L",
        description: "Homogenized toned fresh milk 1L pouch.",
        price: 54,
        stock: 80,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&q=80",
      },
      {
        name: "Amul Masti Dahi 400g Pouch",
        description: "Thick creamy fresh curd dahi 400g pouch.",
        price: 35,
        stock: 60,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500&q=80",
      },
      {
        name: "Maggi 2-Minute Masala Noodles 420g Pack",
        description: "Masala instant noodles 420g family pack.",
        price: 98,
        stock: 50,
        featured: false,
        image:
          "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500&q=80",
      },
      {
        name: "Surf Excel Easy Wash Detergent Powder 1kg",
        description: "Superior stain removal washing powder 1kg.",
        price: 140,
        stock: 40,
        featured: false,
        image:
          "https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?w=500&q=80",
      },
    ],
  },
  {
    store_name: "Suvidha store",
    address: {
      street: "Snehmilan Society, Akshar Park Road",
      area: "behind Railway Ground, Bhavnagar Para",
      pincode: "364003",
      city: "Bhavnagar",
      state: "Gujarat",
      landmark: "behind Railway Ground",
    },
    location: [72.1388, 21.7824],
    contact: {
      phone_number: "+91 92776 50885",
    },
    product_details: {
      categories: ["Grocery Store", "Department Store", "Packaged Foods"],
    },
    custom_products: [
      {
        name: "Amul Butter Pasteurised 500g Pack",
        description: "Delicious rich pasteurised butter 500g.",
        price: 275,
        stock: 50,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&q=80",
      },
      {
        name: "Britannia Good Day Cashew Cookies 600g",
        description: "Crunchy butter cashew biscuits 600g box.",
        price: 150,
        stock: 40,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&q=80",
      },
      {
        name: "Haldiram's Nagpur Bhujia Sev 400g Pack",
        description: "Authentic spicy fried moth flour bhujia sev 400g.",
        price: 115,
        stock: 60,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500&q=80",
      },
      {
        name: "Real Fruit Power Mixed Fruit Juice 1L",
        description: "100% real mixed fruit juice beverage 1L.",
        price: 110,
        stock: 35,
        featured: false,
        image:
          "https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=500&q=80",
      },
      {
        name: "Cadbury Dairy Milk Silk Chocolate Bar 150g",
        description: "Smooth creamy milk chocolate bar 150g.",
        price: 175,
        stock: 45,
        featured: false,
        image:
          "https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=500&q=80",
      },
    ],
  },
  {
    store_name: "Shree Shakti General store",
    address: {
      street: "Vijayrajnagar Main Road",
      area: "Vijayrajnagar",
      pincode: "364003",
      city: "Bhavnagar",
      state: "Gujarat",
      landmark: "Near Vijayrajnagar Circle",
    },
    location: [72.1485, 21.7681],
    contact: {
      phone_number: "+91 94264 62656",
    },
    product_details: {
      categories: ["General Store", "Snacks", "Beverages"],
    },
    custom_products: [
      {
        name: "Coca-Cola Original Soft Drink 1.25L Bottle",
        description: "Refreshing carbonated cola drink 1.25L.",
        price: 65,
        stock: 50,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80",
      },
      {
        name: "Lays India's Magic Masala Potato Chips 90g",
        description: "Crispy spicy masala potato chips 90g.",
        price: 30,
        stock: 80,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&q=80",
      },
      {
        name: "Nivea Soft Light Moisturizing Cream 200ml",
        description: "Fresh non-greasy moisturizing skin cream 200ml.",
        price: 299,
        stock: 30,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=80",
      },
      {
        name: "Colgate MaxFresh Red Gel Toothpaste 150g",
        description: "Intense cooling menthol gel toothpaste 150g.",
        price: 110,
        stock: 50,
        featured: false,
        image:
          "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=500&q=80",
      },
      {
        name: "Dettol Antiseptic Liquid 250ml",
        description: "First aid & personal hygiene disinfectant liquid 250ml.",
        price: 145,
        stock: 40,
        featured: false,
        image:
          "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80",
      },
    ],
  },
  {
    store_name: "Reliance SMART Bazaar",
    address: {
      street: "Ground Flr & 1st Flr, Shiva Blessing, CS No 208/415",
      area: "Nawa Para",
      pincode: "364001",
      city: "Bhavnagar",
      state: "Gujarat",
      landmark: "opposite BMC",
    },
    location: [72.1458, 21.7761],
    contact: {
      phone_number: "+91 1800 891 0001",
    },
    product_details: {
      categories: ["Hypermarket", "Supermarket Items", "Household Goods"],
    },
    custom_products: [
      {
        name: "Pampers Baby Diapers Pants (M Size 64 Count)",
        description: "Soft absorbent all-night dry diaper pants M size.",
        price: 999,
        stock: 40,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&q=80",
      },
      {
        name: "Ariel Matic Front Load Detergent Powder 4kg",
        description: "Tough stain removal front load washing powder 4kg.",
        price: 850,
        stock: 35,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?w=500&q=80",
      },
      {
        name: "Prestige IRIS 750W Mixer Grinder with 3 Jars",
        description: "Heavy duty 750W stainless steel jar mixer grinder.",
        price: 2899,
        stock: 20,
        featured: true,
        image:
          "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500&q=80",
      },
      {
        name: "Milton Thermosteel Flip Lid Flask 1000ml",
        description: "Vacuum insulated 24hr hot & cold stainless steel flask.",
        price: 899,
        stock: 30,
        featured: false,
        image:
          "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80",
      },
      {
        name: "Daffodil Double Bed Microfiber AC Quilt Blanket",
        description: "Ultra soft lightweight reversible AC quilt blanket.",
        price: 1499,
        stock: 25,
        featured: false,
        image:
          "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&q=80",
      },
    ],
  },
];

// Product generator catalog based on categories for default store products
const productCatalogByCategory = {
  Groceries: [
    {
      name: "Basmati Rice 5kg",
      description: "Premium long-grain fragrant basmati rice.",
      price: 450,
      stock: 40,
    },
    {
      name: "Sugar 1kg",
      description: "Refined pure white sugar.",
      price: 45,
      stock: 100,
    },
    {
      name: "Toor Dal 1kg",
      description: "Unpolished nutritious yellow toor dal.",
      price: 160,
      stock: 50,
    },
    {
      name: "Sunflower Oil 1L",
      description: "Healthy cooking sunflower oil pouch.",
      price: 135,
      stock: 60,
    },
  ],
  "Packaged Foods": [
    {
      name: "Instant Noodles 4-Pack",
      description: "Delicious masala instant noodles.",
      price: 56,
      stock: 80,
    },
    {
      name: "Tomato Ketchup 500g",
      description: "Tangy rich tomato ketchup bottle.",
      price: 95,
      stock: 45,
    },
    {
      name: "Oats 1kg",
      description: "100% natural rolled oats for healthy breakfast.",
      price: 190,
      stock: 35,
    },
  ],
  "Daily Essentials": [
    {
      name: "Cow Milk 1L",
      description: "Fresh pasteurized whole cow milk.",
      price: 64,
      stock: 50,
    },
    {
      name: "Salt 1kg",
      description: "Iodized crystal refined salt.",
      price: 28,
      stock: 120,
    },
    {
      name: "Matchbox Pack of 10",
      description: "Safety matches bundle.",
      price: 20,
      stock: 200,
    },
  ],
  Snacks: [
    {
      name: "Potato Chips Masala 100g",
      description: "Crispy crunchy spicy potato chips.",
      price: 30,
      stock: 75,
    },
    {
      name: "Salted Peanuts 200g",
      description: "Freshly roasted salted peanuts.",
      price: 60,
      stock: 50,
    },
    {
      name: "Chocolate Biscuit Pack",
      description: "Rich cocoa cream sandwich biscuits.",
      price: 40,
      stock: 90,
    },
  ],
  "Supermarket Items": [
    {
      name: "Green Tea 25 Bags",
      description: "Antioxidant-rich organic green tea bags.",
      price: 180,
      stock: 30,
    },
    {
      name: "Honey 250g",
      description: "Pure wild forest organic honey.",
      price: 150,
      stock: 40,
    },
  ],
  "Household Goods": [
    {
      name: "Dishwash Gel 500ml",
      description: "Lemon infused grease-removing dishwash liquid.",
      price: 110,
      stock: 40,
    },
    {
      name: "Detergent Powder 1kg",
      description: "Stain removing fabric detergent.",
      price: 140,
      stock: 60,
    },
    {
      name: "Floor Cleaner 1L",
      description: "Disinfectant surface and floor cleaner.",
      price: 175,
      stock: 50,
    },
  ],
  "Personal Care": [
    {
      name: "Bathing Soap Pack of 4",
      description: "Moisturizing skin bathing soap.",
      price: 160,
      stock: 50,
    },
    {
      name: "Shampoo 180ml",
      description: "Nourishing anti-dandruff shampoo.",
      price: 135,
      stock: 45,
    },
    {
      name: "Toothpaste 150g",
      description: "Complete care mint herbal toothpaste.",
      price: 90,
      stock: 80,
    },
  ],
  "Spices & Pulses": [
    {
      name: "Red Chilli Powder 200g",
      description: "Pure vibrant spicy red chilli powder.",
      price: 85,
      stock: 55,
    },
    {
      name: "Turmeric Powder 200g",
      description: "High-curcumin ground turmeric powder.",
      price: 65,
      stock: 60,
    },
    {
      name: "Chana Dal 1kg",
      description: "Clean unpolished chana dal.",
      price: 110,
      stock: 50,
    },
  ],
  "Packaged Snacks": [
    {
      name: "Banana Chips 200g",
      description: "Traditional crunchy salted banana chips.",
      price: 70,
      stock: 40,
    },
    {
      name: "Bhujia Sev 400g",
      description: "Spicy crisp gram flour bhujia.",
      price: 115,
      stock: 65,
    },
  ],
  Beverages: [
    {
      name: "Mango Juice 1L",
      description: "Refreshing delicious Alphonso mango pulp drink.",
      price: 85,
      stock: 40,
    },
    {
      name: "Cold Drink Cola 1.25L",
      description: "Carbonated refreshing cola beverage.",
      price: 65,
      stock: 70,
    },
  ],
  "Daily Groceries": [
    {
      name: "Wheat Flour (Atta) 5kg",
      description: "100% whole wheat chakki fresh atta.",
      price: 230,
      stock: 45,
    },
    {
      name: "Mustard Oil 1L",
      description: "Kachi ghani cold pressed mustard oil.",
      price: 165,
      stock: 35,
    },
  ],
  "Organic Foods": [
    {
      name: "Organic Jaggery 1kg",
      description: "Unrefined natural cane sugar jaggery powder.",
      price: 95,
      stock: 40,
    },
    {
      name: "Organic Quinoa 500g",
      description: "Protein-rich white organic quinoa grains.",
      price: 220,
      stock: 25,
    },
  ],
  "Dairy Products": [
    {
      name: "Fresh Paneer 200g",
      description: "Soft fresh cottage cheese paneer block.",
      price: 90,
      stock: 30,
    },
    {
      name: "Pure Cow Ghee 500ml",
      description: "Traditional aromatic pure cow ghee jar.",
      price: 340,
      stock: 35,
    },
    {
      name: "Butter 100g",
      description: "Salted creamy dairy butter.",
      price: 58,
      stock: 60,
    },
  ],
  Confectionery: [
    {
      name: "Dark Chocolate Bar 80g",
      description: "70% Cocoa premium dark chocolate bar.",
      price: 120,
      stock: 40,
    },
    {
      name: "Assorted Candies Pack",
      description: "Fruit flavored sweet boiled candies.",
      price: 50,
      stock: 100,
    },
  ],
  "Grains & Flour": [
    {
      name: "Multigrain Atta 5kg",
      description: "High fiber multigrain flour mix.",
      price: 260,
      stock: 30,
    },
    {
      name: "Poha (Flattened Rice) 1kg",
      description: "Thick clean poha for breakfast.",
      price: 65,
      stock: 50,
    },
  ],
  "Household Cleaners": [
    {
      name: "Glass Cleaner Spray 500ml",
      description: "Streak-free shine glass & window cleaner.",
      price: 105,
      stock: 35,
    },
    {
      name: "Toilet Cleaner 500ml",
      description: "Disinfectant deep cleaning toilet gel.",
      price: 92,
      stock: 50,
    },
  ],
  "Dairy & Snacks": [
    {
      name: "Flavored Yogurt 100g",
      description: "Strawberry flavored fresh probiotic curd.",
      price: 35,
      stock: 45,
    },
    {
      name: "Cheese Slices 200g",
      description: "Processed creamy cheese slices pack.",
      price: 140,
      stock: 40,
    },
  ],
};

async function seed() {
  try {
    const dbUri = process.env.DB_URI || process.env.MONGODB_URI;
    if (!dbUri) throw new Error("DB_URI or MONGODB_URI is required in .env");

    await mongoose.connect(dbUri);
    console.log("Connected to MongoDB");

    console.log("Safely upserting Users, Stores, and Products to restore all store and product data...");

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
      "Dairy & Snacks": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&q=80",
      "Clothing Store": "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&q=80",
      "Men's Apparel": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&q=80",
      "Fabric Store": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80",
      "Wholesale Store": "https://images.unsplash.com/photo-1590794056226-77ef3a6c4743?w=500&q=80",
      "Kitchenware": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500&q=80",
      "Gadgets": "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=500&q=80",
      "Hypermarket": "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&q=80",
      "Department Store": "https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=500&q=80",
      "Book Store": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80",
      "Stationery": "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&q=80",
      "Books": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80",
      "Grocery Store": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80",
      "General Store": "https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=500&q=80",
      "General Supplies": "https://images.unsplash.com/photo-1590794056226-77ef3a6c4743?w=500&q=80",
      "Grain Provisions": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&q=80"
    };

    // 1. Process Stores & Vendor User accounts safely
    const storeRecords = [];

    for (let index = 0; index < inputStoresData.length; index++) {
      const item = inputStoresData[index];
      const idx = index + 1;
      const cleanPhone = item.contact && item.contact.phone_number 
        ? item.contact.phone_number.replace(/\D/g, '').slice(-10) 
        : `987654320${idx}`;
      
      const emailUsername = item.store_name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const userEmail = `${emailUsername}@store.com`;
      const userName = `${emailUsername}_owner`;
      const fullAddr = `${item.address.street}, ${item.address.area}, ${item.address.city}, ${item.address.state} - ${item.address.pincode}`;

      let vendorUser = await User.findOne({ $or: [{ email: userEmail }, { userName: userName }] });
      if (!vendorUser) {
        const addrId = new mongoose.Types.ObjectId();
        vendorUser = await User.create({
          userName,
          name: `${item.store_name} Owner`,
          phoneNumber: cleanPhone,
          email: userEmail,
          password: 'password123',
          role: 'vendor',
          location: { type: 'Point', coordinates: item.location },
          address: fullAddr,
          addresses: [{
            _id: addrId, label: "Store Address", fullAddress: fullAddr,
            street: item.address.street, area: item.address.area,
            city: item.address.city, state: item.address.state,
            pincode: item.address.pincode,
            location: { type: "Point", coordinates: item.location },
            isDefault: true
          }],
          selectedAddressId: String(addrId)
        });
      } else {
        vendorUser.location = { type: 'Point', coordinates: item.location };
        vendorUser.address = fullAddr;
        await vendorUser.save();
      }

      // Upsert Store
      const primaryCategory = item.product_details.categories[0] || 'General';
      let storeObj = await Store.findOne({ name: item.store_name });
      if (!storeObj) {
        storeObj = await Store.create({
          owner: vendorUser._id,
          name: item.store_name,
          description: `Welcome to ${item.store_name}! We provide quality ${item.product_details.categories.join(', ')}.`,
          logo: `https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80`,
          banner: `https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200&q=80`,
          storePhoto: {
            url: `https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80`,
            fileId: '',
            name: `${item.store_name} Photo`,
            thumbnailUrl: `https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&q=80`
          },
          category: primaryCategory,
          location: { type: 'Point', coordinates: item.location },
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
          rating: +(4.2 + (index % 5) * 0.15).toFixed(1),
          isOpen: true
        });
      } else {
        storeObj.location = { type: 'Point', coordinates: item.location };
        storeObj.address = {
          street: item.address.street,
          area: item.address.area,
          pincode: item.address.pincode,
          city: item.address.city,
          state: item.address.state,
          landmark: item.address.landmark || ''
        };
        storeObj.emergencyContact = cleanPhone;
        storeObj.isVerifiedByAdmin = true;
        storeObj.isOpen = true;
        await storeObj.save();
      }

      storeRecords.push({ storeObj, item });
    }

    // 2. Ensure System Accounts Exist (Admin, tasavvuf, Bhavnagar user, Delivery Riders)
    let adminUser = await User.findOne({ userName: 'admin' });
    if (!adminUser) {
      const adminAddrId = new mongoose.Types.ObjectId();
      await User.create({
        userName: 'admin', name: 'Admin User', phoneNumber: '9876543299',
        email: 'admin@ecom.com', password: 'adminpassword', role: 'admin',
        location: { type: 'Point', coordinates: [72.1385, 21.7828] },
        address: 'Bhavnagar, Gujarat, India',
        addresses: [{
          _id: adminAddrId, label: 'Main Office', fullAddress: 'Talawdi Chawk, Vadva, Bhavnagar, Gujarat',
          street: 'Alka Cinema Road', area: 'Vadva', city: 'Bhavnagar', state: 'Gujarat', pincode: '364001',
          location: { type: 'Point', coordinates: [72.1385, 21.7828] }, isDefault: true
        }],
        selectedAddressId: String(adminAddrId)
      });
    }

    let tasavvufUser = await User.findOne({ userName: 'tasavvuf' });
    if (!tasavvufUser) {
      const tasavvufAddrId = new mongoose.Types.ObjectId();
      await User.create({
        _id: new mongoose.Types.ObjectId('6a71aa365c655cf0e77a3c71'),
        userName: 'tasavvuf', name: 'Tasavvufhusen Imdadhusen Gori', phoneNumber: '08469191292',
        email: 'tasavvufg@gmail.com', password: 'test', role: 'user',
        location: { type: 'Point', coordinates: [72.1385, 21.7828] },
        address: 'Talawdi Chawk, Vadva, Bhavnagar',
        addresses: [{
          _id: tasavvufAddrId, label: 'Home', fullAddress: 'Talawdi Chawk, Alka Cinema Road, Vadva, Bhavnagar, Gujarat - 364001',
          street: 'Alka Cinema Road', area: 'Vadva', city: 'Bhavnagar', state: 'Gujarat', pincode: '364001',
          location: { type: 'Point', coordinates: [72.1385, 21.7828] }, isDefault: true
        }],
        selectedAddressId: String(tasavvufAddrId)
      });
    }

    const emptyDoc = { url: '', fileId: '', name: '', thumbnailUrl: '' };
    let rahulRider = await User.findOne({ userName: 'rahul_rider' });
    if (!rahulRider) {
      const rahulAddrId = new mongoose.Types.ObjectId();
      await User.create({
        userName: 'rahul_rider', name: 'Rahul Sharma', phoneNumber: '9876543201',
        email: 'rahul@delivery.com', password: 'test', role: 'deliveryPartner',
        location: { type: 'Point', coordinates: [70.7920, 22.2860] },
        address: 'Sardarnagar, Rajkot, Gujarat',
        addresses: [{
          _id: rahulAddrId, label: 'Home', fullAddress: 'Sardarnagar, Rajkot, Gujarat',
          street: 'Sardarnagar Main Rd', area: 'Sardarnagar', city: 'Rajkot', state: 'Gujarat', pincode: '360001',
          location: { type: 'Point', coordinates: [70.7920, 22.2860] }, isDefault: true
        }],
        selectedAddressId: String(rahulAddrId),
        deliveryPartnerProfile: {
          dateOfBirth: '1998-03-15', emergencyContactName: 'Suresh Sharma', emergencyContactNumber: '9876543100',
          currentAddress: { street: 'Sardarnagar Main Rd', area: 'Sardarnagar', pincode: '360001', city: 'Rajkot', state: 'Gujarat' },
          vehicleType: 'Motorcycle', vehicleNumber: 'GJ-03-AB-1234', drivingLicenseNumber: 'GJ0320220001234',
          vehicleModel: 'Honda Activa 6G', insuranceNumber: 'INS-2026-001234',
          documents: { drivingLicense: emptyDoc, vehicleRC: emptyDoc, vehicleInsurance: emptyDoc, aadhaarCard: emptyDoc, panCard: emptyDoc, profilePhoto: emptyDoc },
          isVerified: true, isAvailable: true, currentOrderId: null
        }
      });
    }

    let bhavnagarRider = await User.findOne({ userName: 'bhavnagar_rider' });
    if (!bhavnagarRider) {
      const vijayAddrId = new mongoose.Types.ObjectId();
      await User.create({
        userName: 'bhavnagar_rider', name: 'Vijay Rathod', phoneNumber: '9876543021',
        email: 'bhavnagar@delivery.com', password: 'test', role: 'deliveryPartner',
        location: { type: 'Point', coordinates: [72.1400, 21.7830] },
        address: 'Vadva, Bhavnagar, Gujarat',
        addresses: [{
          _id: vijayAddrId, label: 'Home', fullAddress: 'Vadva, Bhavnagar, Gujarat - 364001',
          street: 'Shelarsha Chowk', area: 'Vadva', city: 'Bhavnagar', state: 'Gujarat', pincode: '364001',
          location: { type: 'Point', coordinates: [72.1400, 21.7830] }, isDefault: true
        }],
        selectedAddressId: String(vijayAddrId),
        deliveryPartnerProfile: {
          dateOfBirth: '1997-05-10', emergencyContactName: 'Ramesh Rathod', emergencyContactNumber: '9876543099',
          currentAddress: { street: 'Shelarsha Chowk', area: 'Vadva', pincode: '364001', city: 'Bhavnagar', state: 'Gujarat' },
          vehicleType: 'Motorcycle', vehicleNumber: 'GJ-04-XY-9876', drivingLicenseNumber: 'GJ0420230009876',
          vehicleModel: 'Hero Splendor', insuranceNumber: 'INS-2026-009876',
          documents: { drivingLicense: emptyDoc, vehicleRC: emptyDoc, vehicleInsurance: emptyDoc, aadhaarCard: emptyDoc, panCard: emptyDoc, profilePhoto: emptyDoc },
          isVerified: true, isAvailable: true, currentOrderId: null
        }
      });
    }

    // 3. Upsert Products safely
    let totalProductsCreated = 0;
    for (const { storeObj, item } of storeRecords) {
      let featuredCount = 0;
      if (item.custom_products && Array.isArray(item.custom_products)) {
        for (const cp of item.custom_products) {
          const isFeatured = featuredCount < 3 && cp.featured !== false;
          if (isFeatured) featuredCount++;

          const existingProd = await Product.findOne({ store: storeObj._id, name: cp.name });
          if (!existingProd) {
            await Product.create({
              store: storeObj._id,
              name: cp.name,
              description: cp.description || `Quality ${cp.name} available at ${storeObj.name}`,
              price: Number(cp.price),
              stock: Number(cp.stock || 50),
              images: [cp.image || categoryImageMap[storeObj.category] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80"],
              category: item.product_details.categories[0] || storeObj.category,
              featured: isFeatured,
              status: 'active'
            });
            totalProductsCreated++;
          } else {
            existingProd.price = Number(cp.price);
            existingProd.description = cp.description;
            existingProd.featured = isFeatured;
            if (cp.image) existingProd.images = [cp.image];
            await existingProd.save();
          }
        }
      } else {
        const categories = item.product_details.categories;
        for (const cat of categories) {
          const catalogProducts = productCatalogByCategory[cat] || [
            { name: `${cat} Item 1`, description: `Fresh high-quality ${cat}`, price: 100, stock: 50 },
            { name: `${cat} Item 2`, description: `Popular selling ${cat}`, price: 150, stock: 40 }
          ];

          for (const p of catalogProducts) {
            const catImg = categoryImageMap[cat] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80";
            const isFeatured = featuredCount < 3;
            if (isFeatured) featuredCount++;
            const prodName = `${p.name} (${storeObj.name.split(' ')[0]})`;

            const existingProd = await Product.findOne({ store: storeObj._id, name: prodName });
            if (!existingProd) {
              await Product.create({
                store: storeObj._id,
                name: prodName,
                description: p.description,
                price: p.price,
                stock: Math.max(p.stock, 25),
                images: [catImg],
                category: cat,
                featured: isFeatured,
                status: 'active'
              });
              totalProductsCreated++;
            }
          }
        }
      }
    }

    console.log(`Database non-destructive seeding / upsert completed successfully! ${storeRecords.length} stores updated/restored.`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed with error:", error);
    process.exit(1);
  }
}

seed();
