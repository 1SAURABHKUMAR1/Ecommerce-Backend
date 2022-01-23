const express = require("express");
const router = express.Router();

// middleware
const { isLoggedIn } = require("../middleware/user")


// controllers
const {
    captureStripePayment,
    captureRazorPayPayment,
} = require("../controllers/paymentController");


// stripte route
router.route("/capturestripe").post(isLoggedIn, captureStripePayment);

// razorpay route
router.route("/capturerazorpay").post(isLoggedIn, captureRazorPayPayment);

module.exports = router;