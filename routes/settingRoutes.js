const express = require('express');

const {
    getSettings, 
    updateSettings
} = require('../controllers/settingController');
const { protect } = require('../controllers/authController');

const router = express.Router();

router.use(protect);

router.route('/').get(getSettings).patch(updateSettings);

module.exports = router;