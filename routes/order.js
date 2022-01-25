const express = require("express");
const router = express.Router();

// middleware
const { isLoggedIn, customRole } = require("../middleware/user");


// controllers
const {
    createOrder,
    getSingleOrder,
    getLoggedUserOrders,
    adminGetAllOrders,
    adminUpdateOrder,
} = require("../controllers/orderController");


// order routes
router.route("/order/create").post(isLoggedIn, createOrder);
router.route("/order/:orderId").get(isLoggedIn, getSingleOrder);
router.route("/myorder").get(isLoggedIn, getLoggedUserOrders);


// admin routes
router.route("/admin/orders").get(isLoggedIn, customRole("admin"), adminGetAllOrders);
router.route("/admin/order/:orderId")
    .put(isLoggedIn, customRole("admin"), adminUpdateOrder)

module.exports = router;