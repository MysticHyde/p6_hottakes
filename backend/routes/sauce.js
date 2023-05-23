const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');


const sauceController = require('../controllers/sauce');

router.get('/', auth, sauceController.getAllSauces);
router.post('/', auth, multer, sauceController.newSauce);

router.get('/:id', auth, sauceController.getSauce);
router.put('/:id', auth, multer, sauceController.editSauce);
router.delete('/:id', auth, sauceController.deleteSauce);

router.post('/:id/like', auth, multer, sauceController.likeSauce);

module.exports = router;