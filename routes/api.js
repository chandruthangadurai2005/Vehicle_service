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
router.post('/add-employee', async (req, res) => {
  const { emp_id, branch_id, role_id, phone_no, date_of_joining } = req.body;
  try {
    console.log("Received data:", req.body);

    await db.query(
      `INSERT INTO employee (emp_id, branch_id, role_id, phone_no, date_of_joining)
       VALUES ($1, $2, $3, $4, $5)`,
      [emp_id, branch_id, role_id, phone_no, date_of_joining]
    );
    res.json({ message: "Employee added successfully" });
  } catch (error) {
    console.error("❌ Error adding employee:", error);
    res.status(500).json({ error: "Database operation failed" });
  }
});
router.get('/search-customer', async (req, res) => {
  const { field, query } = req.query;
  try {
    const result = await pool.query(`SELECT * FROM customer WHERE ${field} = $1`, [query]);
    res.json(result.rows);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
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
