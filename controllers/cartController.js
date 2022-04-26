const Cart = require('../models/cart');
const User = require('../models/user');
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

exports.getLoggedUserCart = BigPromise(async (req, res, next) => {
    const cartItems = await Cart.findOne({
        user: req.user._id,
    });

    res.status(200).json({
        success: true,
        cartItems: cartItems ? cartItems : [],
    });
});
