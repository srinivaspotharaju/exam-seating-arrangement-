const express = require('express');
const { assignSeats } = require('../controllers/seatingController');
const router = express.Router();

router.post('/arrange-seating', assignSeats);

module.exports = router;
