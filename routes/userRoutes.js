const express = require('express');
const multer  = require('multer');

const {
  signIn,
  signOut,
  signUp,
  protect,
  updatePassword,
  getMe,
  uploadAvatarImage,
  updateMyUserData,
} = require('../controllers/authController');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 1048576 } });

const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.get('/signout', signOut);

// Protect all routes after this middleware
router.use(protect);

router.post('/image', upload.single('avatar'), uploadAvatarImage);
router.route('/me').get(getMe).patch(updateMyUserData);
router.patch('/updateMyPassword', updatePassword);

module.exports = router;
