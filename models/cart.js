const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'User id is required'],
    },
    cartItems: [
        {
            name: {
                type: String,
                required: [true, 'Product Name is required'],
            },
            quantity: {
                type: Number,
                required: [true, 'Quantity is required'],
            },
            image: {
                type: String,
                required: [true, 'Product image is required'],
            },
            price: {
                type: Number,
                required: [true, 'Product price is required'],
            },
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                required: [true, 'Product Id is required'],
                ref: 'product',
            },
        },
    ],
    modifiedOn: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('cart', cartSchema);
