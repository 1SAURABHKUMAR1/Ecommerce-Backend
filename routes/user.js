const express = require('express');
const router = express.Router();

// middleware
const { isLoggedIn, customRole } = require('../middleware/user');

// getting user controllers
const {
    signup,
    login,
    logout,
    forgotPassword,
    resetPassword,
    LoggedInUserDetails,
    updatePassword,
    updateProfile,
    adminAllUsers,
    managerAllUsers,
    adminGetSingleUser,
    adminChangeUserDetails,
    adminDeleteUser,
    singleUserViaId,
} = require('../controllers/userController');

// making routes for user api
router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/forgotpassword').post(forgotPassword);
router.route('/password/reset/:token').post(resetPassword);
router.route('/profile').get(isLoggedIn, LoggedInUserDetails);
router.route('/password/update').post(isLoggedIn, updatePassword);
router.route('/profile/update').post(isLoggedIn, updateProfile);
router.route('/my-profile').get(isLoggedIn, singleUserViaId);

// routes for admin
router
    .route('/admin/users')
    .get(isLoggedIn, customRole('admin'), adminAllUsers);
router
    .route('/admin/user/:id')
    .get(isLoggedIn, customRole('admin'), adminGetSingleUser)
    .put(isLoggedIn, customRole('admin'), adminChangeUserDetails)
    .delete(isLoggedIn, customRole('admin'), adminDeleteUser);

// route for manager
router
    .route('/manager/users')
    .get(isLoggedIn, customRole('manager'), managerAllUsers);

// exporting routes
module.exports = router;
