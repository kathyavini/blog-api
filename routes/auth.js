const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');

router
  .route('/login') //
  .post(controller.loginUser);

// Route to test jwt authorization only
router
  .route('/protected') //
  .get(controller.testProtectedRoute);

module.exports = router;
