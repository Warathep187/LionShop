const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const CartSchema = new mongoose.Schema({
    user: {
        type: ObjectId,
        ref: "User",
        index: true
    },
    product: {
        type: ObjectId,
        ref: "Product"
    },
    type_: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        min: 0
    },
    amount: {
        type: Number,
        min: 0,
        default: 0
    },
    createdAt: Date
})

module.exports = mongoose.model("Cart", CartSchema);