const Conversation = require("../models/conversation");
const Message = require("../models/message");
const User = require("../models/user");
const { authMiddleware, adminMiddleware } = require("../utils/auth");

const getMessages = async (parent, args, { req }) => {
    try {
        const { _id } = await authMiddleware(req);
        const messages = await Message.find({ user: _id }).select("from to text");
        return messages;
    } catch (e) {
        throw new Error(e.message);
    }
};

const adminGetConversations = async (parent, args, { req }) => {
    try {
        await adminMiddleware(req);
        const conversations = await Conversation.find({})
            .populate("user", "_id username profileImage")
            .sort({ lastMessageAt: -1 });
        return conversations;
    } catch (e) {
        throw new Error(e.message);
    }
};

const adminGetMessages = async (parent, args, { req }) => {
    try {
        await adminMiddleware(req);
        const { conversationId } = args;
        const messages = await Message.find({ conversation: conversationId }).select(
            "from to text"
        );
        await Conversation.updateOne({ _id: conversationId }, { isRead: true });
        return messages;
    } catch (e) {
        throw new Error(e.message);
    }
};

const adminNewChatUsers = async (parent, args, { req }) => {
    try {
        await adminMiddleware(req);
        const conversations = await Conversation.find({}).select("user");
        const mapping = conversations.map((con) => con.user);
        const users = await User.find({ _id: { $nin: mapping }, role: { $ne: "admin" }, verified: true }).select(
            "_id username profileImage"
        );
        return users;
    } catch (e) {
        throw new Error(e.message);
    }
};

const adminCreateNewChat = async (parent, args, { req }) => {
    try {
        await adminMiddleware(req);
        const { userId } = args.input;
        const newConversation = new Conversation({
            user: userId,
            lastMessageAt: Date.now(),
            isRead: true,
        });
        await newConversation.save();
        const conversation = await Conversation.findById(newConversation._id)
            .select("user lastMessageAt isRead")
            .populate("user", "username profileImage");
        return conversation;
    } catch (e) {
        throw new Error(e.message);
    }
};

module.exports = {
    Query: {
        getMessages,
        adminGetConversations,
        adminGetMessages,
        adminNewChatUsers,
    },
    Mutation: {
        adminCreateNewChat,
    },
};
