"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("orders", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      customer_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      product_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("PENDING", "PAID", "CANCELLED", "REFUND"),
        allowNull: false,
        defaultValue: "PENDING",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addConstraint("orders", {
      fields: ["quantity"],
      type: "check",
      name: "check_quantity_positive",
      where: {
        quantity: {
          [Sequelize.Op.gt]: 0,
        },
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("orders");
    await queryInterface.sequelize.query(
      "DROP TYPE IF EXISTS enum_orders_status;",
    );
  },
};
