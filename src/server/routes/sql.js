const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const sqlController = require('../controllers/sqlController');

router.post('/execute', authenticate, sqlController.executeSQL);

module.exports = router;
