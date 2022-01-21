const User = require("../models/user");
const BigPromise = require("../middleware/bigPromise");
const CustomError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const cloudinary = require("cloudinary").v2;
const emailSend = require("../utils/emailSender");
const crypto = require("crypto");
const validator = require("validator");


// user signup 
exports.signup = BigPromise(async (req, res, next) => {

    // if photo not present
    if (!req.files) {
        return next(CustomError(res, "Profile Photo is Required!", 400));
    }

    const { name, email, password } = req.body;

    // if any field missing
    if (!(name && email && password)) {
        return next(CustomError(res, "All Fields Are Mandatory !", 400));
    }

    // check in db
    const userDB = await User.findOne({ email: email });

    if (userDB) {
        return next(CustomError(res, "Email Already Exists", 400));
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
        return next(CustomError(res, "All Fields are mandatory !", 400));
    }

    // get user from db
    const user = await User.findOne({ email: email }).select('+password');

    // if user not present in db
    if (!user) {
        return next(CustomError(res, "Email or password in not valid!", 400));
    }

    // check for password
    const isPasswordCorrect = await user.isValidPassword(password);

    // if password is invalid
    if (!isPasswordCorrect) {
        return next(CustomError(res, "Email or password in not valid!", 400));
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
        return next(CustomError(res, "Email is Required", 400));
    }

    // get user from db
    const user = await User.findOne({ email });

    // if user not present
    if (!user) {
        return next(CustomError(res, "Email is not registered", 400));
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

        return next(CustomError(res, error.message, 400));
    }

});


// forgot password change password
exports.resetPassword = BigPromise(async (req, res, next) => {

    const { token } = req.params;

    // token not present
    if (!token) {
        return next(CustomError(res, "Invalid Url", 400));
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
        return next(CustomError(res, "Token is invalid or expired!", 400));
    }

    const { password, confirmPassword } = req.body;

    // check for confirm password and pass
    if (password != confirmPassword) {
        return next(CustomError(res, "Password And Confirm Password Doesn't Match", 400));
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


//  get user profile info if logged in
exports.LoggedInUserDetails = BigPromise(async (req, res, next) => {

    // got user from isLoggedIn middleware

    // get user from db
    const user = await User.findById(req.user.id);

    //send response and user data
    res.status(200).json({
        success: true,
        user,
    });
})


// update user password
exports.updatePassword = BigPromise(async (req, res, next) => {

    // got user from isLoggedIn middleware

    const { oldPassword, newPassword } = req.body;

    // if any field is missing
    if (!(oldPassword && newPassword)) {
        return next(CustomError(res, "All Fields Are Mandatory", 400));
    }

    // user id via middleware
    const userId = req.user.id;

    // get user from db
    const user = await User.findById(userId).select("+password");

    // check if oldPassword is coorect
    const isPasswordCorrect = await user.isValidPassword(oldPassword);
    if (!isPasswordCorrect) {
        return next(CustomError(res, "The Old Password is not Correct!", 400));
    }

    // change password
    user.password = newPassword;

    // save user model
    await user.save();

    cookieToken(user, res);
});


// update user details
exports.updateProfile = BigPromise(async (req, res, next) => {

    // get user from middleware

    const { name, email } = req.body;

    // all details needed
    if (!(name && email)) {
        return next(CustomError(res, "All fields are mandatory!", 400));
    }

    // check if name is not undefined
    if (!name) {
        return next(CustomError(res, "Name Field Cannot Be Empty", 400));
    }

    // check if email is valid
    if (!validator.isEmail(email)) {
        return next(CustomError(res, "Email is not valid!", 400));
    }

    // object to replace
    const newData = {
        name,
        email,
    }

    // if photo is send update
    if (req.files) {

        // delete old user photo
        await cloudinary.uploader.destroy(req.user.photo.id);

        // upload user photo
        const cloudinaryResult = await cloudinary.uploader.upload(req.files.photo.tempFilePath, {
            folder: "ecommerce",
            width: 250,
            crop: "fit",
        })

        // push photo to be changed
        newData.photo = {
            id: cloudinaryResult.public_id,
            secure_url: cloudinaryResult.secure_url,
        }
    }

    // find user and update the properties
    const user = await User.findByIdAndUpdate(req.user.id, newData, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        user
    })

});


// get all user details if admin
exports.adminAllUsers = BigPromise(async (req, res, next) => {

    // fetch all user from db
    const user = await User.find();

    // return array of user
    res.status(200).json({
        success: true,
        user
    })
});


// get specific user details if admin
exports.adminGetSingleUser = BigPromise(async (req, res, next) => {

    // id from params
    const id = req.params.id;

    // get user from db
    const user = await User.findById(id);

    // if user not present
    if (!user) {
        return next(CustomError(res, "User id is invalid", 400));
    }

    res.status(200).json({
        success: true,
        user
    });
});


// change details of user if admin
exports.adminChangeUserDetails = BigPromise(async (req, res, next) => {

    // get user name and email
    const { name, email, role } = req.body;

    // all detials needed
    if (!(name && email)) {
        return next(CustomError(res, "All fields are mandatory!", 400));
    }

    // if name is undefined
    if (!name) {
        return next(CustomError(res, "Name Field Cannot Be Empty!", 400));
    }

    // email should match the requirment
    if (!validator.isEmail(email)) {
        return next(CustomError(res, "Email is not valid!", 400));
    }

    // role should be only user , manager , admin
    if (!(role == 'user' || role == 'manager' || role == 'admin')) {
        return next(CustomError(res, "Role Should Be only User , Manager Or Admin", 400));
    }

    // obj to send
    const newData = {
        name,
        email,
        role
    }

    // update user
    const user = await User.findByIdAndUpdate(req.params.id, newData, {
        new: true,
        runValidators: true,
    })

    res.status(200).json({
        success: true
    })
});


// admin delete user via id
exports.adminDeleteUser = BigPromise(async (req, res, next) => {

    // get user from db
    const user = await User.findById(req.params.id);

    // user doesnot exists
    if (!user) {
        return next(CustomError(res, "User Doesnot Exists!", 400));
    }

    // delete user photo
    await cloudinary.uploader.destroy(user.photo.id);

    // delete user
    await user.remove();

    res.status(200).json({
        success: true,
    })
});


// get all users who are users only . admins and managers are hidden
exports.managerAllUsers = BigPromise(async (req, res, next) => {

    // find all user from db
    const user = await User.find({ role: 'user' });

    res.status(200).json({
        success: true,
        user
    });
});