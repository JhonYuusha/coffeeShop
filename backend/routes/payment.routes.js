const express = require('express');
const router = express.Router();

const {
  simulatePayment,
  showCancelPage,
  confirmCancel
} = require('../controllers/payment.controller');

// Payment simulation
router.post('/simulate', simulatePayment);

// Cancel flow with token validation
router.get('/order/cancel/:paymentId', showCancelPage);
router.post('/order/cancel/:paymentId', confirmCancel);

module.exports = router;