/**
 * Test Data Fixture for Vingo E2E Tests
 */
module.exports = {
  users: {
    customer: {
      username: 'tasavvufg@gmail.com',
      password: 'test',
      name: 'Tasavvufhusen Imdadhusen Gori',
      role: 'user',
    },
    vendor: {
      username: 'picknpack@store.com',
      password: 'password123',
      name: 'Pick N Pack Owner',
      role: 'vendor',
      storeName: 'Pick N Pack',
    },
    deliveryPartner: {
      username: 'rahul@delivery.com',
      password: 'test',
      name: 'Rahul Sharma',
      role: 'deliveryPartner',
    },
    admin: {
      username: 'admin@ecom.com',
      password: 'adminpassword',
      name: 'Admin User',
      role: 'admin',
    },
    invalid: {
      username: 'nonexistent_user@test.com',
      password: 'wrong_password_xyz',
    },
  },
  geo: {
    rajkot: {
      latitude: 22.2842,
      longitude: 70.7963,
    },
    bhavnagar: {
      latitude: 21.7828,
      longitude: 72.1385,
    },
    unsupportedZone: {
      latitude: 10.0000,
      longitude: 50.0000,
    },
  },
  mockAddress: {
    street: 'Alka Cinema Road',
    area: 'Vadva',
    city: 'Rajkot',
    state: 'Gujarat',
    pincode: '360001',
    fullAddress: 'Alka Cinema Road, Vadva, Rajkot, Gujarat - 360001',
  },
};

