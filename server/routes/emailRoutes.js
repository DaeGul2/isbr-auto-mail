const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'files' });

const {
  createAndSendEmail,
  getAllEmails,
  getEmailById,
  deleteEmail,
} = require('../controllers/emailController');

router.post('/', upload.array('attachments'), createAndSendEmail); // ✅ multer 추가
router.get('/', getAllEmails);
router.get('/:id', getEmailById);
router.delete('/:id', deleteEmail);

module.exports = router;
