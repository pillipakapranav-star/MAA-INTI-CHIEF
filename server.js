// server.js – Simple REST API for SmartServ Kitchen
// Provides in‑memory CRUD for orders and inventory items.
// Run with `npm start` (node server.js) or install nodemon for `npm run dev`.

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(__dirname));

app.use(cors()); // Allow front‑end to call from any origin during demo
app.use(express.json()); // Parse JSON bodies

// ---------- In‑memory data stores ----------
let orders = [];
let inventory = [
  { id: 1, name: 'Ribeye', station: 'GRILL', stock: 12, reserve: 5 },
  { id: 2, name: 'Basil', station: 'PANTRY', stock: 2, reserve: 5 },
  { id: 3, name: 'Salmon', station: 'WOK', stock: 0, reserve: 2 },
];
let nextOrderId = 1;
let nextInventoryId = 4;

// ---------- Helper functions ----------
const findById = (arr, id) => arr.find(item => item.id === Number(id));

// ---------- Orders API ----------
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const { table, station, items, status } = req.body;
  const newOrder = {
    id: nextOrderId++,
    table: table || '??',
    station: station || 'UNKNOWN',
    items: items || [],
    status: status || 'pending',
    createdAt: new Date().toISOString(),
  };
  orders.push(newOrder);
  res.status(201).json(newOrder);
});

app.get('/api/orders/:id', (req, res) => {
  const order = findById(orders, req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

app.put('/api/orders/:id', (req, res) => {
  const order = findById(orders, req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const { table, station, items, status } = req.body;
  if (table !== undefined) order.table = table;
  if (station !== undefined) order.station = station;
  if (items !== undefined) order.items = items;
  if (status !== undefined) order.status = status;
  res.json(order);
});

app.delete('/api/orders/:id', (req, res) => {
  const index = orders.findIndex(o => o.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Order not found' });
  const [deleted] = orders.splice(index, 1);
  res.json(deleted);
});

// ---------- Inventory API ----------
app.get('/api/inventory', (req, res) => {
  res.json(inventory);
});

app.post('/api/inventory', (req, res) => {
  const { name, station, stock, reserve } = req.body;
  if (!name || !station) {
    return res.status(400).json({ error: 'Name and station are required' });
  }
  const newItem = {
    id: nextInventoryId++,
    name,
    station,
    stock: stock ?? 0,
    reserve: reserve ?? 0,
  };
  inventory.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/inventory/:id', (req, res) => {
  const item = findById(inventory, req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  const { name, station, stock, reserve } = req.body;
  if (name !== undefined) item.name = name;
  if (station !== undefined) item.station = station;
  if (stock !== undefined) item.stock = stock;
  if (reserve !== undefined) item.reserve = reserve;
  res.json(item);
});

app.delete('/api/inventory/:id', (req, res) => {
  const index = inventory.findIndex(i => i.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Item not found' });
  const [deleted] = inventory.splice(index, 1);
  res.json(deleted);
});

// ---------- Health check ----------
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));
app.listen(PORT, () => {
  console.log(`SmartServ Kitchen API listening on http://localhost:${PORT}`);
});
