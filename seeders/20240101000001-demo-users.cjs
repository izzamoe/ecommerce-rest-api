'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
    const hashedPasswordStaff = await bcrypt.hash('staff123', 10);

    const users = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'admin@example.com',
        password: hashedPasswordAdmin,
        role: 'ADMIN',
        created_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        email: 'staff@example.com',
        password: hashedPasswordStaff,
        role: 'STAFF',
        created_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('users', users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: ['admin@example.com', 'staff@example.com']
    }, {});
  }
};
