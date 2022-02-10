const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const CommentSchema = new mongoose.Schema({
    user: {
        type: ObjectId,
        ref: "User",
    },
    product: {
        type: ObjectId,
        ref: "Product",
        index: true,
    },
    text: {
        type: String,
        max: 512,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    createdAt: Date,
});

module.exports = mongoose.model("Comment", CommentSchema);
