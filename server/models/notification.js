const mongoose = require("mongoose");
const {ObjectId} = mongoose.Schema;

const NotificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["confirm", "cancel"]
    },
    toUser: {
        type: ObjectId,
        ref: "User",
        index: true,
    },
    orderId: {
        type: ObjectId,
        ref: "Payment"
    },
    createdAt: Date
})

module.exports = mongoose.model("Notification", NotificationSchema);