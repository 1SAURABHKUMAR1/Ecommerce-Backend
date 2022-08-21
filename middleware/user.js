const BigPromise = require('./bigPromise');
const User = require('../models/user');
const CustomError = require('../utils/customError');
const jwt = require('jsonwebtoken');

// middleware for checking if user has token and is logged in or not
exports.isLoggedIn = BigPromise(async (req, res, next) => {
    // getting token from header
    let token = req.cookies.token;

    // if token is not present in cookie but in header
    if (!token && req.header('Authorization')) {
        token = req.header('Authorization').replace('Bearer ', '');
    }

    // token not present in both cookie and header
    if (!token) {
        return next(CustomError(res, 'Login To Proceded', 400));
    }

    // decode the payload from jwt

    let decoded = null;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return CustomError(res, 'Login to procced', 401);
    }

    if (!decoded) {
        return CustomError(res, 'Login to procced', 401);
    }

    // save property
    const user = await User.findOne({ user_id: decoded.user_id });

    if (!user) {
        return CustomError(res, 'User not found', 401);
    }

    req.user = user;

    next();
});

// middleware for checking specific role eg- admin , manager
exports.customRole = (...role) => {
    // ...role converts it into a array
    // eg - we send admin --> [admin] and we can check if req.user.role --> admin is in [admin]
    return (req, res, next) => {
        if (!role.includes(req.user.role)) {
            return next(
                CustomError(
                    res,
                    'You are not authorized to visit this page!',
                    403,
                ),
            );
        }
        next();
    };
};
