# MongoDB to Neon DB (PostgreSQL) Migration Plan

This document outlines the strategy for migrating the `ReCarNation` application's database from MongoDB to Neon DB (Serverless PostgreSQL).

## 1. Current MongoDB Schema Analysis

The current backend uses Mongoose with 4 main models:

### `User` (`userModel.js`)
- Contains user details, authentication (Google/Password), profile info.
- Fields: `name`, `email`, `googleId`, `password`, `profilePicture`, `role` (buyer, seller, admin), `lastLogin`, `isVerified`, `verifiedWith`, `verifiedContact`, `bio`, `phone`, `location`.
- Includes Mongoose `timestamps`.

### `Product` (`productsModel.js`)
- Contains vehicle listings with a reference to the `User` (`listedBy`).
- Fields: `make`, `model`, `year`, `trim`, `mileage`, `price`, `transmission`, `fuelType`, `description`, `location`, `contactNumber`, `images` (Array of objects with `url` and `publicId`), `status`, `isFeatured`.
- Includes Mongoose `timestamps`.

### `Order` (`orderModel.js`)
- Relates a `buyer`, `seller` (both `User`s), and a `product`.
- Fields: `status`, `price`, `paymentStatus`, `paymentMethod` (cash/online), `meetingLocation`, `meetingDate`, `notes`, and Razorpay specific fields (`razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`, `paidAt`, `refundId`, `refundedAt`).
- Includes Mongoose `timestamps`.

### `Wishlist` (`wishlistModel.js`)
- Junction between `User` and `Product`.
- Fields: `userId`, `productId`, `createdAt`.
- Compound unique index on `(userId, productId)`.

---

## 2. Proposed PostgreSQL Schema (Neon DB)

Relational databases require a strict schema. The MongoDB embedded documents (like `images` in `Product`) will be extracted into their own tables.

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id VARCHAR(24) UNIQUE, -- Temporary field for migration mapping
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    google_id VARCHAR(255),
    password VARCHAR(255),
    profile_picture TEXT,
    role VARCHAR(50) DEFAULT 'buyer', -- Consider ENUM: 'buyer', 'seller', 'admin'
    last_login TIMESTAMP WITH TIME ZONE,
    is_verified BOOLEAN DEFAULT false,
    verified_with VARCHAR(50), -- 'phone', 'email'
    verified_contact VARCHAR(255),
    bio VARCHAR(500),
    phone VARCHAR(50),
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id VARCHAR(24) UNIQUE, -- Temporary field for migration mapping
    make VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    trim VARCHAR(255),
    mileage INTEGER NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    transmission VARCHAR(50), -- ENUM: 'automatic', 'manual', 'cvt', 'dualClutch'
    fuel_type VARCHAR(50), -- ENUM: 'petrol', 'diesel', 'hybrid', 'electric', 'cng'
    description TEXT,
    location VARCHAR(255) NOT NULL,
    contact_number VARCHAR(50) NOT NULL,
    listed_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'active', -- ENUM: 'active', 'sold', 'pending'
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product Images Table (Extracts the embedded images array)
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    public_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id VARCHAR(24) UNIQUE, -- Temporary field for migration mapping
    buyer_id UUID NOT NULL REFERENCES users(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    product_id UUID NOT NULL REFERENCES products(id),
    status VARCHAR(50) DEFAULT 'pending',
    price NUMERIC(12, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50) NOT NULL, -- 'cash', 'online'
    meeting_location VARCHAR(255) NOT NULL,
    meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    razorpay_signature VARCHAR(255),
    paid_at TIMESTAMP WITH TIME ZONE,
    refund_id VARCHAR(255),
    refunded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Wishlist Table
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);
```

---

## 3. Migration Strategy

Migrating from NoSQL to SQL requires carefully extracting, transforming, and loading (ETL) the data.

### Step 1: Codebase Refactoring Preparation
- Replace `mongoose` with a PostgreSQL ORM/Query Builder like `Prisma` (Highly Recommended for type safety and easy schema migrations) or `Sequelize`/`TypeORM`.
- Update all model interactions in the controllers (`User.findOne`, `Product.findById`, etc.) to the new ORM syntax.
- **Note:** Prisma makes this much easier by automatically generating types from the schema.

### Step 2: Data Extraction Script
Write a Node.js migration script that connects to both MongoDB and Neon DB simultaneously:
1. **Migrate Users:** Read all users from MongoDB, insert into Neon DB `users` table, keeping the old MongoDB `_id` in the `mongo_id` column.
2. **Migrate Products:** Read all products. Use the MongoDB `listedBy` ID to find the corresponding Neon DB `users.id` via the `mongo_id` column. Insert the product and its extracted `images` into `product_images`.
3. **Migrate Orders:** Read all orders. Map the `buyer`, `seller`, and `product` MongoDB IDs to their new Neon DB UUIDs. Insert the order.
4. **Migrate Wishlists:** Map `userId` and `productId` similarly and insert.

### Step 3: Deployment
1. **Downtime Window:** Put the application in maintenance mode.
2. **Final Sync:** Run the migration script to copy the final state of the database.
3. **Swap Backend:** Deploy the refactored backend pointing to Neon DB.
4. **Validation:** Verify core flows (Auth, Product Listing, Ordering).
