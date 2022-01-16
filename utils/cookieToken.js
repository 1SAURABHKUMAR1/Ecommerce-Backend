const jwt = require("jsonwebtoken");

const cookieToken = (user, res) => {

    // create jwt token
    const token = user.getJwtToken();

    // options of cookie
    const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE_DAY * 24 * 60 * 60 * 1000),
        httpOnly: true,
    }

    // password not to be sent
    user.password = undefined;

    // return cookie and json // cookie and json for web and json for mobile
    return res.status(200).cookie("token", token, options).json({
        success: true,
        token,
        user
    });

};

// export
module.exports = cookieToken;