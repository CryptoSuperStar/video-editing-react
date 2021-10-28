const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const {
  authController,
  loginController,
  registerController,
  oAuthTwitter,
  tokenTwitter,
  googleController,
  facebookController,
  appleController,
  updateUserController,
  connectSocial,
  resetPassword
} = require("../controllers/auth.contoller")


router.get('/auth', auth, authController);
router.post('/loginSSO', loginController);
router.post('/registerSSO', registerController);

router.post('/auth/twitter',  oAuthTwitter);
router.post('/auth/twitter/reverse', tokenTwitter);
router.post('/login_register_google', googleController);
router.post('/login_register_facebook', facebookController);
router.post('/login_register_apple', appleController);

router.post('/update_user', updateUserController);
router.put('/updateSocial', auth, connectSocial);
router.post('/resetPassword', auth, resetPassword);



module.exports = router;