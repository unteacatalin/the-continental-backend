const express = require('express');
// const multer = require('multer');

const {
    getAllGuests,
    getGuestsCount
} = require('../controllers/guestController');
const { protect } = require('../controllers/authController');

const router = express.Router();

router.use(protect);

router.route('/').get(getAllGuests);

router.route('/count').get(getGuestsCount);

module.exports = router;