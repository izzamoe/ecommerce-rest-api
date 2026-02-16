export const OrderStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
  REFUND: "REFUND",
};

export const OrderStatusList = Object.values(OrderStatus);

export const ValidStatusTransitions = {
  [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
  [OrderStatus.PAID]: [OrderStatus.REFUND],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUND]: [],
};
