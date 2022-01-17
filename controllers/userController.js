const User = require("../models/user");
const BigPromise = require("../middleware/bigPromise");
const customError = require("../utils/customError");
const CustomError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const cloudinary = require("cloudinary").v2;
const emailSend = require("../utils/emailSender");
const crypto = require("crypto");

// user signup 
exports.signup = BigPromise(async (req, res, next) => {

    // if photo not present
    if (!req.files) {
        return next(new CustomError('Profile Photo is Required!', 400));
    }

    const { name, email, password } = req.body;

    // if any field missing
    if (!(name && email && password)) {
        return next(new customError('All Fields Are Mandatory !', 400));
    }

    // check in db
    const userDB = await User.findOne({ email: email });

    if (userDB) {
        return next(new CustomError('Email Already Exists', 400));
    }

    // store photo to cloudinary
    let file = req.files.photo;

    const cloudinaryResult = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "ecommerce",
        width: 250,
        crop: "fit",
    })

    // create user 
    const user = await User.create({
        name: name,
        email: email,
        password: password,
        photo: {
            id: cloudinaryResult.public_id,
            secure_url: cloudinaryResult.secure_url,
        },
    });

    // send cookie
    cookieToken(user, res);

});


// user login
exports.login = BigPromise(async (req, res, next) => {

    const { email, password } = req.body;

    // if field missing
    if (!(email && password)) {
        return next(new CustomError('All Fields are mandatory !', 400));
    }

    // get user from db
    const user = await User.findOne({ email: email }).select('+password');

    // if user not present in db
    if (!user) {
        return next(new CustomError('Email or password in not valid!', 400));
    }

    // check for password
    const isPasswordCorrect = await user.isValidPassword(password);

    // if password is invalid
    if (!isPasswordCorrect) {
        return next(new CustomError('Email or password in not valid!', 400));
    }

    // return user cookie
    cookieToken(user, res);

});


// logout user and clearn cookie
exports.logout = BigPromise((req, res, next) => {

    // clear cookie and send a success messsage
    res.status(200).cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    }).json({
        success: true,
        message: "Logout successfull"
    })

});


// request forgot password
exports.forgotPassword = BigPromise(async (req, res, next) => {

    const { email } = req.body;

    // email is required
    if (!email) {
        return next(new CustomError('Email is Required', 400));
    }

    // get user from db
    const user = await User.findOne({ email });

    // if user not present
    if (!user) {
        return next(new CustomError('Email is not registered', 400));
    }

    //  get forgot password token
    const forgotToken = await user.getForgotPasswordToken(user);

    //update user
    await user.save({ validateBeforeSave: false });

    // forgot password url and message
    const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`
    const message = `Paste The link in your browser to change your password ${myUrl}`;

    try {

        // send email
        await emailSend({
            toemail: email,
            subject: "Ecommerce Store :- Forgot Password Request",
            message,
        });

        //  send message
        res.status(200).json({
            success: true,
            message: "Email Send SuccessFully",
        });

    } catch (error) {
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new CustomError(error.message, 400));
    }

});


// forgot password change password
exports.forgotPasswordReset = BigPromise(async (req, res, next) => {

    const { token } = req.params;

    // token not present
    if (!token) {
        return next(new CustomError('Invalid Url', 400));
    }

    // hash token again to find encrpyt password stored in db
    const encryptToken = await crypto.createHash("sha256").update(token).digest("hex");

    // check for token in db  --> both the value show be true ie encrypt token and date > date.now() 
    const user = await User.findOne({
        forgotPasswordToken: encryptToken,
        forgotPasswordExpiry: { $gt: Date.now() }
    });

    // invalid token or expired
    if (!user) {
        return next(new CustomError('Token is invalid or expired!', 400));
    }

    const { password, confirmPassword } = req.body;

    // check for confirm password and pass
    if (password != confirmPassword) {
        return next(new CustomError(`Password And Confirm Password Doesn't Match`, 400));
    }

    // change password
    user.password = password;

    // remove forgotpassword token and forgot password expiry
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    // send json and cookie to user
    cookieToken(user, res);
})