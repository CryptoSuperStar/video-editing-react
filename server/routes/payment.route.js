const express = require('express');
const router = express.Router();

const { paymentController, paymentConfirmController, paymentAppleController, confirmPromoCodeController } = require("../controllers/payment.controller");
const auth = require('../middleware/auth');

router.post('/stripe', paymentController);
router.post('/confirm-payment', paymentConfirmController);
router.post('/create-payment-intent', paymentAppleController)
router.post('/confirm-promo-code', auth, confirmPromoCodeController)


module.exports = router;