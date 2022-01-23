const express = require("express");
const router = express.Router();

// middleware
const { isLoggedIn } = require("../middleware/user")


// controllers
const {
    captureStripePayment,
} = require("../controllers/paymentController");


// stripte route
router.route("/capturestripe").get(isLoggedIn, captureStripePayment);


module.exports = router;