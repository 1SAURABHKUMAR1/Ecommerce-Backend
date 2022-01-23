const BigPromise = require("../middleware/bigPromise");
const CustomError = require("../utils/customError");
const stripe = require('stripe')('sk_test_51KKkXcSDQWmTfWkFUlwmjDJS1UlVnwSGC8HCqSclPb5g6pwHPxXHFabd4XUhgAycrii4f37ZmVkGWoSsWgX3LG2u00feA7Q8nW');


// send and capture stripe payment intent
exports.captureStripePayment = BigPromise(async (req, res, next) => {

    if (!req.body.amount) {
        return next(CustomError(res, "Amount is Required!", 400));
    }

    // payment intent
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: 'inr',
    });

    res.status(200).json({
        success: true,
        amount: req.body.amount,
        client_secret: paymentIntent.client_secret,
        id: paymentIntent.id,
    })

})
