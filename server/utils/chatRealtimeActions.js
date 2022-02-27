const User = require("../models/user");
const Conversation = require("../models/conversation");
const Message = require("../models/message");
const { getOnlineUsersCache } = require("../utils/redisActions");

const checkRole = async (_id) => {
    try {
        const user = await User.findOne({ _id, verified: true }).select("role");
        if (!user) {
            return "Error";
        }
        return user.role;
    } catch (e) {
        return "Error";
    }
};

const setUnreadMessage = async (toUser) => {
    const receiver = await User.findOne({ _id: toUser }).select("unreadMessage");
    receiver.unreadMessage = true;
    await receiver.save();
};
const sendMessageToUser = async ({ _id, message, toUser }) => {
    try {
        const users = await getOnlineUsersCache();
        if (users) {
            const user = users.find((user) => user.userId === toUser);
            if (user) {
                const isExisting = await Conversation.findOne({ user: toUser }).select("_id");
                if (!isExisting) {
                    const newConversation = new Conversation({
                        user: toUser,
                        lastMessageAt: Date.now(),
                    });
                    await newConversation.save();
                    const newMsg = new Message({
                        conversation: newConversation._id,
                        user: toUser,
                        from: _id,
                        to: toUser,
                        text: message,
                        createdAt: Date.now(),
                    });
                    await newMsg.save();
                    return user.socketId;
                } else {
                    await Conversation.updateOne(
                        { _id: isExisting._id },
                        { lastMessageAt: Date.now() }
                    );
                    const newMsg = new Message({
                        conversation: isExisting._id,
                        user: toUser,
                        from: _id,
                        to: toUser,
                        text: message,
                        createdAt: Date.now(),
                    });
                    await newMsg.save();
                    return user.socketId;
                }
            } else {
                setUnreadMessage(toUser);
                const isExisting = await Conversation.findOne({ user: toUser }).select("_id");
                if (!isExisting) {
                    const newConversation = new Conversation({
                        user: toUser,
                    });
                    await newConversation.save();
                    const newMsg = new Message({
                        conversation: newConversation._id,
                        user: toUser,
                        from: _id,
                        to: toUser,
                        text: message,
                        createdAt: Date.now(),
                    });
                    await newMsg.save();
                } else {
                    await Conversation.updateOne(
                        { _id: isExisting._id },
                        { lastMessageAt: Date.now() }
                    );
                    const newMsg = new Message({
                        conversation: isExisting._id,
                        user: toUser,
                        from: _id,
                        to: toUser,
                        text: message,
                        createdAt: Date.now(),
                    });
                    await newMsg.save();
                }
                return "OK";
            }
        } else {
            setUnreadMessage(toUser);
            const isExisting = await Conversation.findOne({ user: toUser }).select("_id");
            if (!isExisting) {
                const newConversation = new Conversation({
                    user: toUser,
                });
                await newConversation.save();
                const newMsg = new Message({
                    conversation: newConversation._id,
                    user: toUser,
                    from: _id,
                    to: toUser,
                    text: message,
                    createdAt: Date.now(),
                });
                await newMsg.save();
            } else {
                await Conversation.updateOne(
                    { _id: isExisting._id },
                    { lastMessageAt: Date.now() }
                );
                const newMsg = new Message({
                    conversation: isExisting._id,
                    user: toUser,
                    from: _id,
                    to: toUser,
                    text: message,
                    createdAt: Date.now(),
                });
                await newMsg.save();
            }
            return "OK";
        }
    } catch (e) {
        return "Error";
    }
};

const setAdminUnreadMessage = async (id) => {
    await User.updateOne({ _id: id }, { unreadMessage: true });
};
const sendMessageToAdmin = async ({ _id, message }) => {
    try {
        const admin = await User.findOne({ role: "admin" }).select("_id unreadMessage");
        const users = await getOnlineUsersCache();
        if (users) {
            const user = users.find((user) => user.userId === admin._id.toString());
            if (user) {
                const isExisting = await Conversation.findOne({ user: _id })
                    .select("_id user lastMessageAt isRead")
                    .populate("user", "username profileImage");
                if (!isExisting) {
                    const newConversation = new Conversation({
                        user: _id,
                        lastMessageAt: Date.now(),
                        isRead: false,
                    });
                    await newConversation.save();
                    const newMsg = new Message({
                        conversation: newConversation._id,
                        user: _id,
                        from: _id,
                        to: admin._id,
                        text: message,
                        createdAt: Date.now(),
                    });
                    await newMsg.save();
                    return {
                        conversation: newConversation,
                        socketId: user.socketId,
                    };
                } else {
                    const newMsg = new Message({
                        conversation: isExisting._id,
                        user: _id,
                        from: _id,
                        to: admin._id,
                        text: message,
                        createdAt: Date.now(),
                    });
                    await newMsg.save();
                    isExisting.lastMessageAt = Date.now();
                    isExisting.isRead = false;
                    await isExisting.save();
                }
                return {
                    conversation: isExisting,
                    socketId: user.socketId,
                };
            } else {
                setAdminUnreadMessage(admin._id);
                const isExisting = await Conversation.findOne({ user: _id }).select("_id");
                if (!isExisting) {
                    const newConversation = new Conversation({
                        user: _id,
                        lastMessageAt: Date.now(),
                        isRead: false,
                    });
                    await newConversation.save();
                    const newMsg = new Message({
                        conversation: newConversation._id,
                        user: _id,
                        from: _id,
                        to: admin._id,
                        text: message,
                        createdAt: Date.now(),
                    });
                    await newMsg.save();
                } else {
                    const newMsg = new Message({
                        conversation: isExisting._id,
                        user: _id,
                        from: _id,
                        to: admin._id,
                        text: message,
                        createdAt: Date.now(),
                    });
                    isExisting.lastMessageAt = Date.now();
                    isExisting.isRead = false;
                    await isExisting.save();
                    await newMsg.save();
                }
                return "OK";
            }
        } else {
            setAdminUnreadMessage(admin._id);
            const isExisting = await Conversation.findOne({ user: _id }).select("_id");
            if (!isExisting) {
                const newConversation = new Conversation({
                    user: _id,
                    lastMessageAt: Date.now(),
                    isRead: false,
                });
                await newConversation.save();
                const newMsg = new Message({
                    conversation: newConversation._id,
                    user: _id,
                    from: _id,
                    to: admin._id,
                    text: message,
                    createdAt: Date.now(),
                });
                await newMsg.save();
            } else {
                const newMsg = new Message({
                    conversation: isExisting._id,
                    user: _id,
                    from: _id,
                    to: admin._id,
                    text: message,
                    createdAt: Date.now(),
                });
                isExisting.lastMessageAt = Date.now();
                isExisting.isRead = false;
                await isExisting.save();
                await newMsg.save();
            }
            return "OK";
        }
    } catch (e) {
        console.log(e);
        return "Error";
    }
};

module.exports = { checkRole, sendMessageToUser, sendMessageToAdmin };
