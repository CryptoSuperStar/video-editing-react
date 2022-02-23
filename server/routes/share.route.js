const express = require('express');
const router = express.Router();

const {uploadYouTube, authYouTube,downloadFile} = require('../controllers/share.controller');

router.get('/authYouTube', authYouTube);
router.post('/uploadToYouTube', uploadYouTube);
router.get('/downloadFile/:project_id/:bucket/:mediaName', downloadFile);
module.exports = router;