const express = require('express');
const router = express.Router();
const { downloadFile } = require('../controllers/emailFileController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/:id/download', authMiddleware, downloadFile);

module.exports = router;
