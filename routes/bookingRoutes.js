const express = require('express');

const {
  getAllBookings,
} = require('../controllers/bookingController');
const { protect } = require('../controllers/authController');

const router = express.Router();

router.use(protect);

router.route('/').get(getAllBookings)
// .post(createEditRoom);

// router.route('/:id').patch(createEditRoom).delete(deleteRoom);
//   .post(protect, restrictTo('admin', 'lead-guide'), createTour);

module.exports = router;
