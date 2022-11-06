const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/* GET users listing. */
router.get('/', userController.listUsers);

/* POST new user */
router.post('/', userController.newUser);

module.exports = router;
