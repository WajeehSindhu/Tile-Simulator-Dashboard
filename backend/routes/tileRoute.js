const express = require('express');
const router = express.Router();
const upload = require('../middlewear/upload');
const { createTile, getTiles } = require('../controllers/tileController');

// For uploading files (images)
router.post('/tiles', upload.array('images'), createTile);

router.get('/tiles', getTiles);

module.exports = router;

