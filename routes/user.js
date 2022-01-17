const express = require("express");
const router = express.Router();

// middleware
const { isLoggedIn } = require("../middleware/user");

// getting user controllers
const { signup,
    login,
    logout,
    forgotPassword,
    forgotPasswordReset,
    LoggedInUserDetails,
} = require("../controllers/userController");


// making routes for user api
router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotpassword").post(forgotPassword);
router.route("/password/reset/:token").post(forgotPasswordReset);
router.route("/profile").get(isLoggedIn, LoggedInUserDetails);

// exporting routes
module.exports = router;