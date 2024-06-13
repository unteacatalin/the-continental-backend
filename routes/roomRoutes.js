const express = require('express');
const multer  = require('multer');

const {
  getRooms,
  deleteRoom,
  createEditRoom,
  uploadRoomImage,
  deleteAllRooms,
  initRooms,
  getAllRooms
} = require('../controllers/roomController');
const { protect } = require('../controllers/authController');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 1048576 } });

const router = express.Router();

router.use(protect);

router.route('/').get(getRooms).post(createEditRoom).delete(deleteAllRooms);
router.get('/init', initRooms);
router.get('/all', getAllRooms);

router.post('/image', upload.single('image'), uploadRoomImage);
router.route('/:id').patch(createEditRoom).delete(deleteRoom);
//   .post(protect, restrictTo('admin', 'lead-guide'), createTour);

module.exports = router;
