'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const orders = [
      {
        id: '660e8400-e29b-41d4-a716-446655440001',
        customer_name: 'John Doe',
        product_name: 'Laptop Dell XPS 13',
        quantity: 2,
        status: 'PENDING',
        created_at: new Date()
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440002',
        customer_name: 'Jane Smith',
        product_name: 'iPhone 15 Pro',
        quantity: 1,
        status: 'PAID',
        created_at: new Date()
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440003',
        customer_name: 'Bob Wilson',
        product_name: 'Samsung Galaxy S24 Ultra',
        quantity: 3,
        status: 'CANCELLED',
        created_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('orders', orders, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('orders', {
      id: [
        '660e8400-e29b-41d4-a716-446655440001',
        '660e8400-e29b-41d4-a716-446655440002',
        '660e8400-e29b-41d4-a716-446655440003'
      ]
    }, {});
  }
};
