const express = require('express');
const router = express.Router();
const { crawler, generator } = require('../controllers');

router.post('/crawl-webpage', crawler)

router.post('/generate-video', generator)

module.exports = router;