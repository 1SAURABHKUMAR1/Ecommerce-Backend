const express = require("express");
const router = express.Router();

// middleware
const { isLoggedIn, customRole } = require("../middleware/user")


// controller of product
const { addProduct,
} = require("../controllers/productController");


// product route


// product route for admin
router.route("/admin/product/add").post(isLoggedIn, customRole('admin'), addProduct);


module.exports = router;