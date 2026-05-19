const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/databaseController');

// In a real app you might want admin-only middleware here
// e.g., router.use(require('../middleware/auth'), require('../middleware/admin'));

// Route: GET /api/database/tables
router.get('/tables', databaseController.getTables);

// Route: GET /api/database/tables/:name
router.get('/tables/:name', databaseController.getTableData);

// Route: PUT /api/database/tables/:name/:id
router.put('/tables/:name/:id', databaseController.updateRow);

// Route: POST /api/database/query
router.post('/query', databaseController.executeCustomQuery);

module.exports = router;
