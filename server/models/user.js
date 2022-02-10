const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        required: true,
        index: true
    },
    password: {
        type: String,
        trim: true,
        require: true,
        select: false
    },
    username: {
        type: String,
        trim: true,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: "user"
    },
    profileImage: {
        url: {
            type: String,
            default: "https://racemph.com/wp-content/uploads/2016/09/profile-image-placeholder.png"
        },
        public_id: {
            type: String,
            default: ""
        }
    },
    security: {
        otp: {
            type: String,
            default: "",
        },
        expirationTime: Date
    },
    unreadMessage: {
        type: Boolean,
        default: false,
    },
    unreadNotification: {
        type: Boolean,
        default: false,
    },
})

module.exports = mongoose.model("User", UserSchema);