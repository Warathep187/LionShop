const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true,
        index: true,
    },
    description: {
        type: String,
        require: true,
        trim: true,
    },
    coverImage: {
        url: String,
        public_id: String,
    },
    images: [
        {
            url: String,
            public_id: String,
        },
    ],
    category: {
        type: ObjectId,
        ref: "Category",
    },
    multipleType: {
        type: Boolean,
        default: false,
    },
    types: [
        {
            type_: String,
            price: {
                type: Number,
                min: 0,
            },
            amount: {
                type: Number,
                min: 0,
            },
        },
    ],
    type: {
        price: {
            type: Number,
            min: 0,
        },
        amount: {
            type: Number,
            min: 0,
        },
    },
    rating: {
        sumPoint: Number,
        ratings: Number,
    },
    sold: Number,
    createdAt: Date
});

module.exports = mongoose.model("Product", ProductSchema);
