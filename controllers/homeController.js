// big Promise
const BigPromise = require("../middleware/bigPromise");

// controller of home route
exports.home = BigPromise((req, res) => {
    res.status(200).json({
        success: true,
        greeting: "Welcome To Home API"
    });
});