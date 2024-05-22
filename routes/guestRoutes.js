const express = require('express');
// const multer = require('multer');

const {
    getAllGuests,
    createEditGuest,
    deleteGuest,
    getGuestsCount,
    deleteAllGuests,
    initGuests
} = require('../controllers/guestController');
const { protect } = require('../controllers/authController');

const router = express.Router();

router.use(protect);

router.route('/').get(getAllGuests).post(createEditGuest).delete(deleteAllGuests);
router.get('/init', initGuests);

router.route('/count').get(getGuestsCount);
router.route('/:id').patch(createEditGuest).delete(deleteGuest);

module.exports = router;