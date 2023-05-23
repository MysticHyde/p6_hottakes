const express = require('express');
const router = express.Router();

const fieldsValidator = require('../middleware/fields-validator');

const userController = require('../controllers/user');

router.post('/signup', fieldsValidator, userController.signup);
router.post('/login', fieldsValidator, userController.login);

module.exports = router;