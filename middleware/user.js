const BigPromise = require("./bigPromise");
const User = require("../models/user");
const CustomError = require("../utils/customError");
const jwt = require("jsonwebtoken");

// middleware for checking if user has token and is logged in or not
exports.isLoggedIn = BigPromise(async (req, res, next) => {

    // getting token from header
    let token = req.cookies.token;

    // if token is not present in cookie but in header
    if (!token && req.header("Authorization")) {
        token = req.header("Authorization").replace("Bearer", "");
    }

    // token not present in both cookie and header
    if (!token) {
        return next(new CustomError("Login To Proceded", 401));
    }

    // decode the payload from jwt
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // save property
    req.user = await User.findById(decoded.user_id);

    next();
});


// middleware for checking specific role eg- admin , manager
exports.customRole = (...role) => {

    // ...role converts it into a array 
    // eg - we send admin --> [admin] and we can check if req.user.role --> admin is in [admin] 
    return (req, res, next) => {
        if (!role.includes(req.user.role)) {
            return next(new CustomError('You are not authorized to visit this page!', 403));
        }
        next();
    }

}