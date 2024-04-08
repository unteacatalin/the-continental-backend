const express = require('express');
const fastify = require('fastify')();

fastify.register(require('@fastify/multipart'))

const {
  getAllRooms,
  deleteRoom,
  createEditRoom,
  uploadRoomImage
} = require('../controllers/roomController');
const { protect } = require('../controllers/authController');

const router = express.Router();

router.use(protect);

router.route('/').get(getAllRooms).post(createEditRoom);

fastify.post('/image', uploadRoomImage);
router.route('/:id').patch(createEditRoom).delete(deleteRoom);
//   .post(protect, restrictTo('admin', 'lead-guide'), createTour);

module.exports = router;
