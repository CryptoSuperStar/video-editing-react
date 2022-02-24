const express = require('express');
const router = express.Router();

const {uploadYouTube, authYouTube} = require('../controllers/share.controller');

router.get('/authYouTube', authYouTube);
router.post('/uploadToYouTube', uploadYouTube);

module.exports = router;