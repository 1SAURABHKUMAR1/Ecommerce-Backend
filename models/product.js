const mongoose = require("mongoose");


// product schema
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Product Name is required"],
        trim: true,
        maxlength: [120, "Product Name Must Be Less Than 120 characters!"],
    },
    price: {
        type: String,
        required: [true, "Product Price is required"],
    },
    description: {
        type: String,
        required: [true, "Please Provide Description Of Product!"],
    },
    photos: [
        {
            id: {
                type: String,
                required: true,
            },
            secure_url: {
                type: String,
                required: true
            },
        },
    ],
    category: {
        type: String,
        required: [true, "Please Select A Catgory Of Product"],
        enum: {
            values: ["shortsleeves", "longsleeves", "sweatshirt", "hoodies"],
            message: `Please Select Category From- "shortsleeves", "longsleeves", "sweatshirt", "hoodies"`,
        }
    },
    brand: {
        type: String,
        required: [true, "Please Add A Brand For the Product!"],
    },
    stock: {
        type: Number,
        required: [true, "Please Add Stock Number Of Product!"],
    },
    rating: {
        type: Number,
        default: 0,
    },
    numberOfReviews: {
        type: Number,
        default: 0,
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'user',
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            rating: {
                type: Number,
                required: true,
            },
            comment: {
                type: String,
                required: true,
            },
        },
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


// export model
module.exports = mongoose.model("product", productSchema);