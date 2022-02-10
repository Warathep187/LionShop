const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const MessageSchema = new mongoose.Schema({
    conversation: {
        type: ObjectId,
        ref: "Conversation",
        index: true,
    },
    user: {
        type: ObjectId,
        ref: "User",
        index: true,
    },
    from: {
        type: ObjectId,
        ref: "User",
    },
    to: {
        type: ObjectId,
        ref: "User",
    },
    text: String,
    createdAt: Date,
});

module.exports = mongoose.model("Message", MessageSchema);
