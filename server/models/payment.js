const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const PaymentSchema = new mongoose.Schema({
    user: {
        type: ObjectId,
        ref: "User",
        index: true
    },
    products: [
        {
            product: {
                type: ObjectId,
                ref: "Product",
            },
            type_: String,
            price: {
                type: Number,
                min: 0
            },
            amount: {
                type: Number,
                min: 0
            },
            isReviewed: {
                type: Boolean,
                default: false
            }
        }
    ],
    status: {
        confirm: {
            type: Boolean,
            default: false
        },
        cancel: {
            type: Boolean,
            default: false
        }
    },
    slipImage: {
        public_id: String,
        url: String,
    },
    fullName: {
        type: String,
        trim: true,
        default: ""
    },
    address: {
        type: String,
        trim: true,
        default: "",
    },
    tel: {
        type: String,
        trim: true,
        default: "",
    },
    trackingNumber: {
        type: String,
        trim: true,
        default: "",
    },
    reviewExpirationTime: Date,
    createdAt: Date
})

module.exports = mongoose.model("Payment", PaymentSchema);