const express = require('express');
const router = express.Router();
const {
  getResponseStatus,
  submitResponse,
} = require('../controllers/emailResponseController');

router.get('/:token', getResponseStatus);       // 응답 상태 조회
router.post('/:token', submitResponse);         // 응답 제출

module.exports = router;
