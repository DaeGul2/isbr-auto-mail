const express = require('express');
const router = express.Router();
const {
  createAndSendEmail,
  getAllEmails,
  getEmailById,
  deleteEmail,
} = require('../controllers/emailController');

router.post('/', createAndSendEmail);           // C
router.get('/', getAllEmails);                  // R (list)
router.get('/:id', getEmailById);               // R (detail)
router.delete('/:id', deleteEmail);             // D

module.exports = router;
