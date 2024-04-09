const express = require('express');

const {
  getAllRooms,
  deleteRoom,
  createEditRoom,
  uploadRoomImage
} = require('../controllers/roomController');
const { protect } = require('../controllers/authController');
const { upload}  = require('./app');

const router = express.Router();

router.use(protect);

router.route('/').get(getAllRooms).post(createEditRoom);

router.post('/image', upload.single('image'), uploadRoomImage);
router.route('/:id').patch(createEditRoom).delete(deleteRoom);
//   .post(protect, restrictTo('admin', 'lead-guide'), createTour);

module.exports = router;
