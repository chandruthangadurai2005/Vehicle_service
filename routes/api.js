const express = require('express');
const router = express.Router();
const db = require('../db');

// Helper function for error handling
const handleDBError = (err, res) => {
  console.error('Database error:', err);
  res.status(500).json({ error: 'Database operation failed' });
};

// CRUD operations for all entities
const entities = [
  'customer', 'vehicles', 'employee', 'service', 'inventory', 'billing'
];

entities.forEach(entity => {
  // Create
  router.post(`/add-${entity}`, async (req, res) => {
    try {
      const columns = Object.keys(req.body).join(', ');
      const values = Object.values(req.body);
      const placeholders = values.map((_, i) => `$${i+1}`).join(', ');
      
      await db.query(
        `INSERT INTO ${entity} (${columns}) VALUES (${placeholders})`,
        values
      );
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

  // Search
  router.get(`/search-${entity}`, async (req, res) => {
    try {
      const { field, query } = req.query;
      const result = await db.query(
        `SELECT * FROM ${entity} WHERE ${field} ILIKE $1`,
        [`%${query}%`]
      );
      res.json(result.rows);
    } catch (err) {
      handleDBError(err, res);
    }
  });
});

// Special routes
router.put('/update-service/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { description, emp_id } = req.body;
    await db.query(
      'UPDATE service SET description = $1, emp_id = $2 WHERE service_id = $3',
      [description, emp_id, id]
    );
    res.json({ message: 'Service updated successfully' });
  } catch (err) {
    handleDBError(err, res);
  }
});

router.delete('/delete-vehicle/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM vehicles WHERE vehicle_id = $1', [id]);
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    handleDBError(err, res);
  }
});
// Example: inside api.js
router.get('/customer', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM customer');
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching customers:", error);  // Add this line
    res.status(500).json({ error: "Database operation failed" });
  }
});

module.exports = router;
