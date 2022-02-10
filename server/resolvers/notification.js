const Notification = require("../models/notification");
const {authMiddleware} = require("../utils/auth");

const getNotifications = async (parent, args, {req}) => {
    try {
        const {_id} = await authMiddleware(req);
        const notifications = await Notification.find({toUser: _id}).sort({createdAt: -1});
        return notifications;
    }catch(e) {
        throw new Error(e.message);
    }
}

module.exports = {
    Query: {
        getNotifications
    }
}