const BigPromise = require("../middleware/bigPromise");
const CustomError = require("../utils/customError");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const Razorpay = require("razorpay");
const { nanoid } = require("nanoid");


// send and create stripe payment intent
exports.captureStripePayment = BigPromise(async (req, res, next) => {

    if (!req.body.amount) {
        return next(CustomError(res, "Amount is Required!", 400));
    }

    // payment intent
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: 'inr',

        metadata: {
            integration_check: 'accept_a_payment',
        }
    });

    res.status(200).json({
        success: true,
        amount: req.body.amount,
        client_secret: paymentIntent.client_secret,
        id: paymentIntent.id,
    })

})


// send and create razorpay payment 
exports.captureRazorPayPayment = BigPromise(async (req, res, next) => {

    if (!req.body.amount) {
        return next(CustomError(res, "Amount is required!", 401));
    }

    if (req.body.amount < 100) {
        return next(CustomError(res, "Amount Should Be Greater then 1", 401));
    }

    let instance = new Razorpay(
        {
            key_id: process.env.RAZORPAY_API_KEY,
            key_secret: process.env.RAZORPAY_SECRET
        }
    )

    const randomReciept = await nanoid();

    let myOrder = await instance.orders.create({
        amount: req.body.amount,
        currency: "INR",
        receipt: `receipt#${randomReciept}`,
    })

    res.status(200).json({
        success: true,
        amount: req.body.amount,
        order: {
            id: myOrder.id,
            amount: myOrder.amount,
            currency: myOrder.currency
        }
    })

});