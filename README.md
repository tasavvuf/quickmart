# QuickMart — Hyperlocal Multi-Vendor Marketplace & Delivery Platform

**QuickMart** is a production-ready, full-stack hyperlocal marketplace platform (Blinkit + Swiggy Instamart hybrid) featuring real-time multi-vendor store operations, customer ordering, 20km geo-radius delivery partner dispatching, and atomic order state management.

---

## 🚀 Key Features

### 🛒 Customer Experience
- **Geo-location Vendor Discovery**: View nearby stores, search products, and filter by categories.
- **Featured Products**: Highlights up to 3 featured products per vendor store.
- **Cart & Checkout**: Real-time cart calculations with snapshot product prices.
- **Live Order Tracking**: Real-time status progress tracking (`/orders/:orderId`) with immediate post-checkout redirection.

### 🏪 Vendor Store Operations
- **Store Setup & Management**: Registration with store details, category tags, and ImageKit store photos.
- **Product Inventory**: Add/edit products, stock control, and toggle up to 3 featured products per store.
- **Order Processing**: Manage incoming orders through a strict state machine (`PENDING` → `ACCEPTED` → `PREPARING` → `READY`).

### 🚴 Delivery Partner Ecosystem
- **Step-Wise Onboarding**: 4-step registration wizard (`Stepper.jsx`) capturing account credentials, GPS location, emergency contacts, vehicle details, and uploaded verification documents.
- **Geo-Radius Order Dispatch**: Available orders automatically filtered within a **20km radius** using Haversine distance calculations.
- **Atomic Order Acceptance**: Concurrency-safe claiming (`findOneAndUpdate`) preventing race conditions when multiple partners accept the same order.
- **Delivery State Machine**: Partner advances order through `ASSIGNED` → `PICKED_UP` → `OUT_FOR_DELIVERY` → `DELIVERED`.
- **Document Privacy**: Uploaded verification documents (License, RC, Insurance, Aadhaar, PAN) are encrypted and visible **strictly to administrators**.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, Lucide Icons, Framer Motion, React Toastify |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose, JSON Web Tokens (JWT) |
| **Storage & Uploads** | ImageKit API, Multer (Memory Storage) |
| **Geospatial Engine** | MongoDB `2dsphere` Indexing, GeoJSON (`Point`), Haversine Formula |

---

## ⚙️ Getting Started

### 1. Prerequisites
- **Node.js**: `v18+`
- **MongoDB**: Local MongoDB instance or Atlas connection string.

### 2. Environment Setup
Create a `.env` file inside the `backend` directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ecom-final
JWT_SECRET=your_jwt_secret_key_here
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_endpoint
```

### 3. Installation & Seeding
```bash
# Clone the repository
git clone <repo-url>
cd ecom-final

# Install backend dependencies
cd backend
npm install

# Seed the database (users, vendor stores, products, delivery partners)
node seeder.js

# Install frontend dependencies
cd ../hybridCom
npm install
```

### 4. Running the Development Servers
```bash
# Start backend API server (runs on port 5000)
cd backend
npm start

# Start frontend Vite dev server (runs on http://localhost:5173)
cd ../hybridCom
npm run dev
```

---

## 📚 Project Documentation

Detailed technical design documents are available in the [`docs/`](./docs) directory:
- 📖 [**Architecture Guide (`docs/ARCHITECTURE.md`)**](./docs/ARCHITECTURE.md) — System design, dual state machine, geospatial engine, and database schemas.
- 📡 [**API Reference (`docs/API_DOCUMENTATION.md`)**](./docs/API_DOCUMENTATION.md) — Complete REST API routes for Auth, Store, Products, Cart, Customer Orders, Vendor, and Delivery modules.
- 🤖 [**AI Agent Guide (`.agents/AGENTS.md`)**](./.agents/AGENTS.md) — Mandatory guidelines and standards for AI coding assistants working in this repository.