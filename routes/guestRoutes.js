const express = require('express');

const {
    getGuests,
    createEditGuest,
    deleteGuest,
    getAllGuests,
    deleteAllGuests,
    initGuests
} = require('../controllers/guestController');
const { protect } = require('../controllers/authController');

const router = express.Router();

router.use(protect);

router.route('/').get(getGuests).post(createEditGuest).delete(deleteAllGuests);
router.get('/init', initGuests);
router.get('/all', getAllGuests);

router.route('/:id').patch(createEditGuest).delete(deleteGuest);

module.exports = router;