import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    customerName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'customer_name'
    },
    productName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'product_name'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'PAID', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'PENDING'
    }
  }, {
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    underscored: true
  });

  Order.prototype.canTransitionTo = function(newStatus) {
    const validTransitions = {
      'PENDING': ['PAID', 'CANCELLED'],
      'PAID': [],
      'CANCELLED': []
    };

    return validTransitions[this.status]?.includes(newStatus) || false;
  };

  return Order;
};
