const express = require('express');

const {
  getBookings,
  getBooking,
  createEditBooking,
  deleteBooking,
  getBookingsAfterDate,
  getStaysAfterDate,
  getBookedRoomsInInterval,
  getStaysTodayActivity,
  deleteAllBookings,
  initBookings
} = require('../controllers/bookingController');
const { protect } = require('../controllers/authController');

const router = express.Router();

router.use(protect);

router.route('/').get(getBookings).post(createEditBooking).delete(deleteAllBookings);
router.get('/after-date/:date', getBookingsAfterDate);
router.get('/stays-after-date/:date', getStaysAfterDate);
router.get('/booked-rooms-in-interval', getBookedRoomsInInterval);
router.get('/today-activity', getStaysTodayActivity);
router.post('/init', initBookings);

router.route('/:id').get(getBooking).patch(createEditBooking).delete(deleteBooking);

module.exports = router;
