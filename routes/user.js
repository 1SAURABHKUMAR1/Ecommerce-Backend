const express = require("express");
const router = express.Router();

// middleware
const { isLoggedIn } = require("../middleware/user");

// getting user controllers
const { signup,
    login,
    logout,
    forgotPassword,
    resetPassword,
    LoggedInUserDetails,
    updatePassword,
    updateProfile,
} = require("../controllers/userController");


// making routes for user api
router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotpassword").post(forgotPassword);
router.route("/password/reset/:token").post(resetPassword);
router.route("/profile").get(isLoggedIn, LoggedInUserDetails);
router.route("/password/update").post(isLoggedIn, updatePassword);
router.route("/profile/update").post(isLoggedIn, updateProfile);

// exporting routes
module.exports = router;