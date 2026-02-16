const users = [
  { id: 1, name: "A", active: true },
  { id: 2, name: "B", active: false },
  { id: 3, name: "C", active: true },
];

const result = users.flatMap((num) => {
  if (num.active) {
    return num;
  } else {
    return [];
  }

  // if (num >= 0) {
  //   return num * 2; // Returns a value (which is implicitly wrapped in an array)
  // } else {
  //   return []; // Returns an empty array, effectively filtering the item out
  // }
});

console.log(result);

const products = [
  { id: 1, name: "Keyboard", price: 300000 },
  { id: 2, name: "Mouse", price: 150000 },
  { id: 3, name: "Monitor", price: 2500000 },
];

const hasil = products.flatMap((prod) => {
  if (prod.price >= 300000) {
    delete prod.price;
    return prod;
  } else {
    return [];
  }
});

console.log(hasil);

const orders = [
  { id: 1, status: "PENDING" },
  { id: 2, status: "PAID" },
  { id: 3, status: "PENDING" },
  { id: 4, status: "CANCELLED" },
];

let NILAIAWAL = { PENDING: [], PAID: [], CANCELLED: [] };

const groubs = orders.flatMap((xx) => {
  if (xx.status == "PAID") {
    NILAIAWAL.PAID.push(xx.id);
  }
  if (xx.status == "CANCELLED") {
    NILAIAWAL.CANCELLED.push(xx.id);
  }
  if (xx.status == "PENDING") {
    NILAIAWAL.PENDING.push(xx.id);
  }
});
console.log(NILAIAWAL);

const transactions = [
  { id: 1, amount: 500000, status: "PENDING" },
  { id: 2, amount: 300000, status: "PAID" },
  { id: 3, amount: 700000, status: "PAID" },
  { id: 4, amount: 200000, status: "CANCELLED" },
  { id: 5, amount: 450000, status: "PAID" },
];

const ahha = transactions
  .flatMap((prod) => {
    if (prod.status == "PAID") {
      return prod;
    } else {
      return [];
    }
  })
  .sort((a, b) => b.amount - a.amount);

console.log(ahha);

const ordersx = [
  { id: "ORD-1", priority: 2, createdAt: 1700000200000 },
  { id: "ORD-2", priority: 1, createdAt: 1700000100000 },
  { id: "ORD-3", priority: 1, createdAt: 1700000050000 },
  { id: "ORD-4", priority: 3, createdAt: 1700000000000 },
];

let antrian = [];

function enqueue(order) {
  antrian.push(order);
  antrian.sort((a, b) => a.priority - b.priority || a.createdAt - b.createdAt);
}

function dequeue() {
  if (antrian.length == 0) {
    return "Antrian Habis";
  }
  const order = antrian.shift();
  console.log("Mengeluarkan " + order.id);
}

// Masuk ke antrian
ordersx.forEach(enqueue);

dequeue();
dequeue();
dequeue();
dequeue();
