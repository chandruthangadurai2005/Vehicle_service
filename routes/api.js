const express = require('express');
const router = express.Router();
const db = require('../db');

const USERS = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'employee', password: 'emp123', role: 'employee' }
];

// Access to sessions from server.js
let sessions;

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(
    u => u.username === username && u.password === password
  );
  if (user) {
    // Create a session
    const sessionId = Date.now().toString() + Math.random().toString(36);
    // Get sessions from app locals (we'll set this in server.js)
    if (req.app.locals.sessions) {
      req.app.locals.sessions.set(sessionId, { username: user.username, role: user.role });
    }
    res.json({ success: true, role: user.role, sessionId: sessionId });
  } else {
    res.json({ success: false, message: 'Invalid username or password' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  if (sessionId && req.app.locals.sessions) {
    req.app.locals.sessions.delete(sessionId);
  }
  res.json({ success: true });
});

// Helper for handling DB errors
const handleDBError = (err, res) => {
  console.error('Database error:', err);
  res.status(500).json({ error: 'Database operation failed' });
};

// Entity list
const entities = ['customer', 'vehicles', 'employee', 'service', 'inventory', 'billing', 'branches'];

// CRUD for all entities
entities.forEach(entity => {
  // Create
  router.post(`/add-${entity}`, async (req, res) => {
    try {
      const columns = Object.keys(req.body).join(', ');
      const values = Object.values(req.body);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
      await db.query(`INSERT INTO ${entity} (${columns}) VALUES (${placeholders})`, values);
      res.json({ message: `${entity} added successfully` });
    } catch (err) {
      handleDBError(err, res);
    }
  });

  // Read all
  router.get(`/${entity}`, async (req, res) => {
    try {
      const result = await db.query(`SELECT * FROM ${entity}`);
      res.json(result.rows);
    } catch (err) {
      handleDBError(err, res);
    }
  });
});

// Special route (custom update for service)
router.put('/update-service/:id', async (req, res) => {
  const { id } = req.params;
  const { description, emp_id } = req.body;
  try {
    await db.query(
      'UPDATE service SET description = $1, emp_id = $2 WHERE service_id = $3',
      [description, emp_id, id]
    );
    res.json({ message: 'Service updated successfully' });
  } catch (err) {
    handleDBError(err, res);
  }
});

// Universal DELETE
router.delete('/delete/:table/:key/:id', async (req, res) => {
  const { table, key, id } = req.params;
  try {
    await db.query(`DELETE FROM ${table} WHERE ${key} = $1`, [id]);
    res.json({ message: `${table} record deleted successfully` });
  } catch (err) {
    handleDBError(err, res);
  }
});

// Universal UPDATE
router.put('/update/:table/:key/:id', async (req, res) => {
  const { table, key, id } = req.params;
  const updates = req.body;
  const keys = Object.keys(updates);
  const values = Object.values(updates);
  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  try {
    await db.query(`UPDATE ${table} SET ${setClause} WHERE ${key} = $${keys.length + 1}`, [...values, id]);
    res.json({ message: `${table} record updated successfully` });
  } catch (err) {
    handleDBError(err, res);
  }
});

module.exports = router;
