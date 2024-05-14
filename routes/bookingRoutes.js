const express = require('express');

const {
  getBookings,
  getBooking,
  createEditBooking,
  deleteBooking,
  getBookingsAfterDate
} = require('../controllers/bookingController');
const { protect } = require('../controllers/authController');

const router = express.Router();

router.use(protect);

router.route('/').get(getBookings).post(createEditBooking);
router.get('/after-date', getBookingsAfterDate);

router.route('/:id').get(getBooking).patch(createEditBooking).delete(deleteBooking);

module.exports = router;
