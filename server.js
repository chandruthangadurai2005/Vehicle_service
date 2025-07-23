const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');

// Middlewares
app.use(cors());
app.use(express.json());

// Serve only non-HTML static files
app.use('/assets', express.static(path.join(__dirname, 'public'), {
  index: false
}));

// Serve specific non-HTML files
app.use((req, res, next) => {
  if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|pdf|pptx)$/)) {
    express.static(path.join(__dirname, 'public'))(req, res, next);
  } else {
    next();
  }
});

// Simple session storage (in production, use proper session management)
const sessions = new Map();

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API routes
const apiRoutes = require('./routes/api');
// Make sessions available to API routes
app.locals.sessions = sessions;
app.use('/api', apiRoutes);

// Authentication middleware
const requireAuth = (req, res, next) => {
  const sessionId = req.headers['x-session-id'] || req.query.session;
  if (sessionId && sessions.has(sessionId)) {
    req.user = sessions.get(sessionId);
    next();
  } else {
    res.redirect('/');
  }
};

// Serve login.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve login.html explicitly
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});



// Protected route for main application
app.get('/index.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Catch all other routes and redirect to login
app.get('*', (req, res) => {
  res.redirect('/');
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
