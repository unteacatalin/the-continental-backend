const express = require('express');
const multer  = require('multer');

const {
  getAllRooms,
  deleteRoom,
  createEditRoom,
  uploadRoomImage,
  deleteAllRooms,
  initRooms
} = require('../controllers/roomController');
const { protect } = require('../controllers/authController');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 1048576 } });

const router = express.Router();

router.use(protect);

router.route('/').get(getAllRooms).post(createEditRoom).delete(deleteAllRooms);
router.post('/init', initRooms);

router.post('/image', upload.single('image'), uploadRoomImage);
router.route('/:id').patch(createEditRoom).delete(deleteRoom);
//   .post(protect, restrictTo('admin', 'lead-guide'), createTour);

module.exports = router;
