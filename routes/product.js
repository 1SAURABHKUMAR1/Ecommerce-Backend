const express = require("express");
const router = express.Router();

// middleware
const { isLoggedIn, customRole } = require("../middleware/user")


// controller of product
const {
    addProduct,
    filterProduct,
    adminGetAllProducts,
    getSingleProduct,
    adminUpdateProductInfo,
    adminDeleteProduct,
    addReview,
    deleteReview,
    getSingleProductReviews,
} = require("../controllers/productController");


// product route
router.route("/product").get(filterProduct);
router.route("/product/:id").get(getSingleProduct);


// product route for admin
router.route("/admin/product/add").post(isLoggedIn, customRole('admin'), addProduct);
router.route("/admin/products").get(isLoggedIn, customRole('admin'), adminGetAllProducts);
router.route("/admin/product/:id")
    .put(isLoggedIn, customRole('admin'), adminUpdateProductInfo)
    .delete(isLoggedIn, customRole("admin"), adminDeleteProduct);


// review routes
router.route("/review")
    .put(isLoggedIn, addReview)
    .delete(isLoggedIn, deleteReview);
router.route("/reviews").get(getSingleProductReviews);


module.exports = router;