const express = require('express');

const {
  getAllRooms,
  deleteRoom,
  createEditRoom,
  getImageInfo
} = require('../controllers/roomController');
const { protect } = require('../controllers/authController');

const router = express.Router();

router.use(protect);

router.route('/').get(getAllRooms).post(createEditRoom);
router.post('/image', getImageInfo)

router.route('/:id').patch(createEditRoom).delete(deleteRoom);
//   .post(protect, restrictTo('admin', 'lead-guide'), createTour);

module.exports = router;
