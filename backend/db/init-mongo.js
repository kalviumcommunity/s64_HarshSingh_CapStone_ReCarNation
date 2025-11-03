// MongoDB initialization script
db = db.getSiblingDB('recarnation');

// Create collections if they don't exist
db.createCollection('users');
db.createCollection('products');
db.createCollection('orders');
db.createCollection('wishlists');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.products.createIndex({ "name": "text", "description": "text" });
db.orders.createIndex({ "userId": 1 });
db.orders.createIndex({ "createdAt": -1 });
db.wishlists.createIndex({ "userId": 1 });

print('Database initialized successfully');