const mongoose = require('mongoose');

// schema order
const orderSchema = new mongoose.Schema({
    shippingInfo: {
        address: {
            type: String,
            required: [true, 'Address is Required!'],
        },
        city: {
            type: String,
            required: [true, 'City is Required!'],
        },
        phoneNumber: {
            type: String,
            required: [true, 'Phone Number is Required!'],
        },
        postalCode: {
            type: String,
            required: [true, 'Postal Code is Required!'],
        },
        state: {
            type: String,
            required: [true, 'State is Required!'],
        },
        country: {
            type: String,
            required: [true, 'Country is Required!'],
        },
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'User ID is required'],
    },
    paymentInfo: {
        id: {
            type: String,
            required: [true, 'Payment Id is Required!'],
        },
    },
    taxAmount: {
        type: Number,
        required: [true, 'Tax Amount is Required!'],
    },
    shippingAmount: {
        type: Number,
        required: [true, 'Shipping Amount is Required!'],
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total Amount is Required!'],
    },
    orderStatus: {
        type: String,
        default: 'processing',
        required: true,
    },
    deliveredAt: {
        type: Date,
    },
    orderedAt: {
        type: Date,
        default: Date.now,
    },
    orderItems: [
        {
            name: {
                type: String,
                required: true,
            },
            image: {
                type: String,
                required: true,
            },
            quantity: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product',
                required: true,
            },
        },
    ],
});

module.exports = mongoose.model('order', orderSchema);
