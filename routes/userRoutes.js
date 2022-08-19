const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.use(authController.protect);

router.get('/me', userController.getMe, userController.getUser);
router.patch('/me', userController.getMe, userController.updateMe);

router.route('/').get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateMe)
  .delete(userController.deleteMe);

module.exports = router;
