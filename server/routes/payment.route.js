const express = require('express');
const router = express.Router();

const {paymentController, paymentConfirmController, paymentAppleController} = require("../controllers/payment.controller");

router.post('/stripe', paymentController);
router.post('/confirm-payment', paymentConfirmController);
router.post('/create-payment-intent', paymentAppleController)

module.exports = router;