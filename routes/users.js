const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');

router
  .route('/') //
  .get(controller.listUsers)
  .post(controller.newUser);

router
  .route('/:userId') //
  .get(controller.getUser)
  .put(controller.updateUser)
  .delete(controller.deleteUser);

module.exports = router;
