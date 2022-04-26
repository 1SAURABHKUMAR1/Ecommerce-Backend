const express = require('express');
const router = express.Router();

// middleware
const { isLoggedIn } = require('../middleware/user');

const {
    createCart,
    getLoggedUserCart,
} = require('../controllers/cartController');

router.route('/cart/create').post(isLoggedIn, createCart);
router.route('/mycart').get(isLoggedIn, getLoggedUserCart);

module.exports = router;
