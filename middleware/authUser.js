const jwt = require("jsonwebtoken");

// big promise middleware
const BigPromise = require("./bigPromise");

// middleware authorization of userand exporting it
exports.isLoggedIn = BigPromise((req, res, next) => {

    // getting token from header
    let authToken = req.cookies.token;

    // if token is not present
    if (!authToken && (req.header("Authorization"))) {
        // TODO:
    }

    // remove bearer word 
    authToken = authToken.replace("Bearer", "");

    //
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);

    // TODO: 

    next();
});
