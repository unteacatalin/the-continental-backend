const express = require('express');
// const multer = require('multer');

const {
    getAllGuests,
    createEditGuest
} = require('../controllers/guestController');
const { protect } = require('../controllers/authController');

const router = express.Router();

router.use(protect);

router.route('/').get(getAllGuests).post(createEditGuest);

module.exports = router;