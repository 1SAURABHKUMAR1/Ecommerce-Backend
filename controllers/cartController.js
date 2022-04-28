const Cart = require('../models/cart');
const CustomError = require('../utils/customError');
const BigPromise = require('../middleware/bigPromise');
const mongoose = require('mongoose');

exports.createCart = BigPromise(async (req, res, next) => {
    const { cartItems } = req.body;

    if (!cartItems) {
        return next(CustomError(res, 'All Fields are mandatory', 201));
    }

    if (cartItems && Array.isArray(cartItems)) {
        cartItems?.forEach((cartI) => {
            if (
                !(
                    cartI.productId &&
                    cartI.price &&
                    cartI.image &&
                    cartI.quantity &&
                    cartI.name
                )
            ) {
                return next(CustomError(res, 'All Fields are mandatory', 201));
            }
            if (!mongoose.Types.ObjectId.isValid(cartI.productId)) {
                return next(CustomError(res, 'Product Id not valid!', 201));
            }
        });
    }

    if (!Array.isArray(cartItems)) {
        return next(CustomError(res, 'All Field are mandatory', 201));
    }

    const savedCart = await Cart.findOne({
        user: req.user._id,
    });

    // saved user card exists
    if (savedCart) {
        for (const cartSingleItem of cartItems) {
            // item index
            let itemIndex = savedCart.cartItems.findIndex(
                (element) =>
                    element.productId.toString() ===
                    cartSingleItem.productId.toString(),
            );

            // item exists
            if (itemIndex > -1) {
                savedCart.cartItems[itemIndex].quantity =
                    cartSingleItem.quantity;
            } else {
                // add new item user doesnt have
                savedCart.cartItems.push(cartSingleItem);
            }
        }
        const cart = await savedCart.save();

        return res.status(200).json({
            success: true,
            cart,
        });
    }

    const cart = await Cart.create({
        user: req.user._id,
        cartItems: cartItems,
    });

    res.status(200).json({
        success: true,
        cart,
    });
});

exports.deleteCart = BigPromise(async (req, res, next) => {
    const { productId } = req.params;

    if (!productId) {
        return next(CustomError(res, 'Invalid Request', 403));
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(CustomError(res, 'Invalid Request', 403));
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        return next(CustomError(res, 'Invalid Request', 403));
    }

    cart.cartItems = cart.cartItems.filter(
        (element) => element.productId.toString() !== productId.toString(),
    );

    await cart.save();

    res.status(200).json({
        success: true,
        cart,
    });
});

exports.increaseDecreaseCart = BigPromise(async (req, res, next) => {
    const { action } = req.body;
    const { productId } = req.params;

    if (!productId && !action) {
        return next(CustomError(res, 'Invalid request', 403));
    }

    if (!(action == 'increment') & !(action == 'decrement')) {
        return next(CustomError(res, 'Invalid request', 403));
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(CustomError(res, 'Invalid request', 403));
    }

    const cart = await Cart.findOne({
        user: req.user._id,
    });

    if (!cart) {
        return next(CustomError(res, 'No product found', 403));
    }

    const productIndex = cart.cartItems.findIndex(
        (element) => element.productId.toString() === productId.toString(),
    );

    if (productIndex === -1) {
        return next(CustomError(res, 'Product not in cart', 403));
    }

    if (action === 'increment') {
        cart.cartItems[productIndex].quantity++;
    }
    if (action === 'decrement') {
        cart.cartItems[productIndex].quantity === 1
            ? (cart.cartItems = cart.cartItems.filter(
                  (element) =>
                      element.productId.toString() !== productId.toString(),
              ))
            : cart.cartItems[productIndex].quantity--;
    }

    await cart.save();

    res.status(200).json({
        success: true,
        cart,
    });
});

exports.getLoggedUserCart = BigPromise(async (req, res, next) => {
    const cartItems = await Cart.findOne({
        user: req.user._id,
    });

    const cart = cartItems ? cartItems : [];

    res.status(200).json({
        success: true,
        cart,
    });
});
