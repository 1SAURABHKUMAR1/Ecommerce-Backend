const Order = require("../models/order");
const Product = require("../models/product");
const CustomError = require("../utils/customError");
const BigPromise = require("../middleware/bigPromise");
const mongoose = require("mongoose")

// create orders
exports.createOrder = BigPromise(async (req, res, next) => {

    const {
        shippingInfo,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
        orderItems,
    } = req.body;


    if (!(shippingInfo && paymentInfo && taxAmount && shippingAmount && totalAmount && orderItems)) {
        return next(CustomError(res, "All Fields are mandatory!", 400));
    }

    if (!(shippingInfo.address && shippingInfo.city && shippingInfo.phoneNumber && shippingInfo.postalCode && shippingInfo.state && shippingInfo.country)) {
        return next(CustomError(res, "Shipping Info is missing !", 400));
    }

    const order = await Order.create({
        shippingInfo,
        user: req.user._id,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
        orderItems,
    })

    res.status(200).json({
        success: true,
        order,
    })

});


// get info about specific order
exports.getSingleOrder = BigPromise(async (req, res, next) => {

    let { orderId } = req.params;

    if (!orderId) {
        return next(CustomError(res, "Order Id is required!", 400));
    }

    // if not bson 
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return next(CustomError(res, "Order Id not valid!", 400));
    }

    const order = await Order.findById(orderId).populate("user", "name email role");

    if (!order) {
        return next(CustomError(res, "Order not found!", 400));
    }

    res.status(200).json({
        success: true,
        order,
    })

});


// get logged in user orders
exports.getLoggedUserOrders = BigPromise(async (req, res, next) => {

    const order = await Order.find({ user: req.user._id });

    res.status(200).json({
        success: true,
        order,
    });

})


// admin can get all orders
exports.adminGetAllOrders = BigPromise(async (req, res, next) => {

    const order = await Order.find();

    res.status(200).json({
        success: true,
        order,
    })

});
