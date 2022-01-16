// dependencies
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// user schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a name"],
        maxlength: [40]
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        validate: [validator.isEmail, "Please provide a valid email"]
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: [6],
        select: false,
    },
    role: {
        type: String,
        default: 'user'
    },
    photo: {
        id: {
            type: String,
            required: true,
            // default : a default image id 
        },
        secure_url: {
            type: String,
            required: true,
            // default : a default image url   
        }
    },
    forgotPasswordToken: {
        type: String,
        default: 'abcd',
    },
    forgotPasswordExpiry: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


// HOOKS - encrypt password before save
userSchema.pre('save', async function (next) {

    // if password is not modified dont hash the password again
    if (!this.isModified("password")) {
        return next();
    }

    // if password is modified so first hash the password then add password to db
    this.password = await bcrypt.hash(this.password, 10);
});


// METHOD - validate the password with passed on user password
userSchema.methods.isValidPassword = async function (userPassword) {

    // check if valid password
    return await bcrypt.compare(userPassword, this.password);
}


// METHOD - create and return JWT Token of User
userSchema.methods.getJwtToken = function () {

    // return signed jwt token
    return jwt.sign(
        { user_id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY }
    );
};


// METHOD --  create ,store and return forgot password token
userSchema.methods.getForgotPasswordToken = async function () {

    // generate random string
    const forgotToken = await crypto.randomBytes(20).toString("hex");

    // hash the token and store in db
    this.forgotPasswordToken = await crypto.createHash("sha256").update(forgotToken).digest("hex");

    // store the forgot password expiry (30min)
    this.forgotPasswordExpiry = Date.now() + 30 * 60 * 1000;

    // send user the random string not hash
    return forgotToken;

};


// exporting model of user 
module.exports = mongoose.model("user", userSchema);