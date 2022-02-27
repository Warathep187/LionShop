const User = require("../models/user");
const Payment = require("../models/payment");
const Product = require("../models/product");
const Notification = require("../models/notification");
const {
    deleteProductCache,
    getOnlineUsersCache,
    setNewOnlineUserCache,
    setOnlineUserCache,
} = require("./redisActions");

const addUser = async (userId, socketId) => {
    const users = await getOnlineUsersCache("online");
    if (!users) {
        await setNewOnlineUserCache({ userId, socketId });
    } else {
        const isOnline = users.find((user) => user.userId === userId);
        if (!isOnline) {
            const currentOnlineUsers = [
                ...users,
                {
                    socketId,
                    userId,
                },
            ];
            await setOnlineUserCache(currentOnlineUsers);
        } else {
            const filtered = users.filter((user) => user.userId !== userId);
            const currentOnlineUsers = [
                ...filtered,
                {
                    socketId,
                    userId,
                },
            ];
            await setOnlineUserCache(currentOnlineUsers);
        }
    }
};

const checkUserIsOnline = async (userId) => {
    try {
        const users = await getOnlineUsersCache();
        if (!users) {
            return false;
        }
        const isOnline = users.find((user) => user.userId === userId);
        if (!isOnline) {
            return false;
        }
        return isOnline.socketId;
    } catch (e) {
        throw new Error(e.message);
    }
};

const checkIsAdmin = async (_id) => {
    try {
        const user = await User.findById(_id).select("role");
        if (!user) {
            return false;
        }
        if (user.role !== "admin") {
            return false;
        }
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
};

const createNotification = async (orderId, type, userId) => {
    try {
        const newNotification = new Notification({
            type,
            orderId,
            toUser: userId,
            createdAt: Date.now(),
        });
        await newNotification.save();
    } catch (e) {
        console.log(e);
    }
};

const confirmOrder = async (orderId, type, userId) => {
    const payment = await Payment.findOne({ _id: orderId }).select(
        "products status reviewExpirationTime"
    );
    if (!payment) {
        return "Order not found";
    }
    if (type === "confirm") {
        if (payment.status.confirm) {
            return "ออเดอร์ได้รับการยืนยันแล้ว";
        }
        payment.status.confirm = true;
        payment.reviewExpirationTime = Date.now() + 1000 * 60 * 60 * 24 * 5;
        await payment.save();
        await User.updateOne({ _id: userId }, { unreadNotification: true });
        for (const product of payment.products) {
            await Product.updateOne({ _id: product.product }, { $inc: { sold: product.amount } });
            await deleteProductCache(product.product);
        }
        createNotification(orderId, "confirm", userId);
        return null;
    } else if (type === "cancel") {
        if (payment.status.cancel) {
            return "ออเดอร์ถูกยกเลิกแล้ว";
        }
        payment.status.cancel = true;
        await payment.save();
        await User.updateOne({ _id: userId }, { unreadNotification: true });
        for (const product of payment.products) {
            if (product.type_) {
                await Product.updateOne(
                    { _id: product.product, "types.type_": product.type_ },
                    { $inc: { "types.$.amount": product.amount } }
                );
            } else {
                await Product.updateOne(
                    { _id: product.product },
                    { $inc: { "type.amount": product.amount } }
                );
            }
            await deleteProductCache(product.product);
        }
        createNotification(orderId, "cancel", userId);
        return null;
    }
};

const removeUser = async (socketId) => {
    const onlineUsers = getOnlineUsersCache();
    if (onlineUsers) {
        if (onlineUsers.length > 0) {
            const filtered = onlineUsers.filter((user) => user.socketId !== socketId);
            await setOnlineUserCache(filtered);
        }
    }
};

module.exports = { addUser, checkUserIsOnline, confirmOrder, checkIsAdmin, removeUser };
