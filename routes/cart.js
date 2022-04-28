const express = require('express');
const router = express.Router();

// middleware
const { isLoggedIn } = require('../middleware/user');

const {
    createCart,
    getLoggedUserCart,
    deleteCart,
    increaseDecreaseCart,
} = require('../controllers/cartController');

router
    .route('/user/cart')
    .post(isLoggedIn, createCart)
    .get(isLoggedIn, getLoggedUserCart);

router
    .route('/user/cart/:productId')
    .delete(isLoggedIn, deleteCart)
    .put(isLoggedIn, increaseDecreaseCart);

module.exports = router;
