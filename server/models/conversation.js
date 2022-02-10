const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const ConversationSchema = new mongoose.Schema({
    user: {
        type: ObjectId,
        ref: "User"
    },
    lastMessageAt: Date,
    isRead: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model("Conversation", ConversationSchema);