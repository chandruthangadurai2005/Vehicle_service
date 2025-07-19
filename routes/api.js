const express = require('express');
const router = express.Router();
const db = require('../db');

// -------- Add Customer --------
router.post('/add-customer', async (req, res) => {
  const { name, phone, email, address } = req.body;
  try {
    await db.query(
      'INSERT INTO customer (name, phone_no, email, address) VALUES ($1, $2, $3, $4)',
      [name, phone, email, address]
    );
    res.json({ message: 'Customer added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding customer' });
  }
});

// -------- Add Vehicle --------
router.post('/add-vehicle', async (req, res) => {
  const { type, customer_id } = req.body;
  try {
    await db.query(
      'INSERT INTO vehicles (type, customer_id) VALUES ($1, $2)',
      [type, customer_id]
    );
    res.json({ message: 'Vehicle added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding vehicle' });
  }
});

// -------- Add Employee --------
router.post('/add-employee', async (req, res) => {
  const { emp_name, phone, doj, branch_id } = req.body;
  try {
    await db.query(
      'INSERT INTO employee (name, phone_no, date_of_joining, branch_id) VALUES ($1, $2, $3, $4)',
      [emp_name, phone, doj, branch_id]
    );
    res.json({ message: 'Employee added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding employee' });
  }
});

// -------- Add Service --------
router.post('/add-service', async (req, res) => {
  const { emp_id, vehicle_id, description } = req.body;
  try {
    await db.query(
      'INSERT INTO service (emp_id, vehicle_id, description) VALUES ($1, $2, $3)',
      [emp_id, vehicle_id, description]
    );
    res.json({ message: 'Service added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding service' });
  }
});

// -------- Add Inventory --------
router.post('/add-inventory', async (req, res) => {
  const { part_name, availability, branch_id } = req.body;
  try {
    await db.query(
      'INSERT INTO inventory (part_id, parts_availability, branch_id) VALUES ($1, $2, $3)',
      [part_name, availability, branch_id]
    );
    res.json({ message: 'Inventory added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding inventory' });
  }
});

// -------- Add Billing --------
router.post('/add-billing', async (req, res) => {
  const { service_id, amount, mode, datetime } = req.body;
  try {
    await db.query(
      'INSERT INTO billing (service_id, total_amount, transaction_mode, datetime) VALUES ($1, $2, $3, $4)',
      [service_id, amount, mode, datetime]
    );
    res.json({ message: 'Billing added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding billing' });
  }
});

// -------- Search Customer --------
router.get('/search-customer', async (req, res) => {
  const { name } = req.query;
  try {
    const result = await db.query(
      'SELECT * FROM customer WHERE name ILIKE $1',
      [`%${name}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error searching customer' });
  }
});

// -------- Update Service --------
router.put('/update-service', async (req, res) => {
  const { service_id, new_desc, new_emp_id } = req.body;
  try {
    await db.query(
      'UPDATE service SET description = $1, emp_id = $2 WHERE service_id = $3',
      [new_desc, new_emp_id, service_id]
    );
    res.json({ message: 'Service updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating service' });
  }
});

// -------- Delete Vehicle --------
router.delete('/delete-vehicle/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM vehicles WHERE vehicle_id = $1', [id]);
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting vehicle' });
  }
});

// -------- View All --------
router.get('/customers', async (_, res) => {
  const result = await db.query('SELECT * FROM customer');
  res.json(result.rows);
});
router.get('/vehicles', async (_, res) => {
  const result = await db.query('SELECT * FROM vehicles');
  res.json(result.rows);
});
router.get('/employees', async (_, res) => {
  const result = await db.query('SELECT * FROM employee');
  res.json(result.rows);
});
router.get('/services', async (_, res) => {
  const result = await db.query('SELECT * FROM service');
  res.json(result.rows);
});

module.exports = router;
