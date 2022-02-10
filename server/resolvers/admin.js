const User = require("../models/user");
const Category = require("../models/category");
const Product = require("../models/product");
const Payment = require("../models/payment");
const { adminMiddleware } = require("../utils/auth");
const cloudinary = require("cloudinary").v2;
const { uuid } = require("uuidv4");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const checkIsAdmin = async (parent, args, { req }) => {
    try {
        const { _id } = await adminMiddleware(req);
        const admin = await User.findById(_id);
        return admin;
    } catch (e) {
        throw new Error(e.message);
    }
};

const adminGetPayments = async (parent, args, { req }) => {
    try {
        await adminMiddleware(req);
        const payments = await Payment.find({})
            .select("_id status user createdAt")
            .sort({ createdAt: -1 });
        const newPaymentsFormat = payments;
        return newPaymentsFormat;
    } catch (e) {
        throw new Error(e.message);
    }
};

const adminGetSpecificPayment = async (parent, args, { req }) => {
    try {
        await adminMiddleware(req);
        const { paymentId } = args;
        if (!paymentId) {
            throw new Error("Invalid payment id");
        }
        const payment = await Payment.findById(paymentId).populate(
            "products.product",
            "_id coverImage name"
        );
        if (!payment) {
            throw new Error("Payment not found");
        }
        return payment;
    } catch (e) {
        throw new Error(e.message);
    }
};

const addTrackingNumber = async (parent, args, { req }) => {
    try {
        await adminMiddleware(req);
        const { trackingNumber, paymentId } = args.input;
        if (trackingNumber.trim() === "") {
            throw new Error("Tracking number must be provided");
        }
        const payment = await Payment.findOne({ _id: paymentId }).select("status trackingNumber");
        if (payment.status.cancel) {
            throw new Error("Payment is canceled");
        }
        if (!payment.status.confirm) {
            throw new Error("Please confirm before add a tracking number");
        }
        payment.trackingNumber = trackingNumber;
        await payment.save();
        return paymentId;
    } catch (e) {
        throw new Error(e.message);
    }
};

const adminGetUserProfile = async (parent, args, { req }) => {
    try {
        await adminMiddleware(req);
        const {userId} = args;
        const user = await User.findById(userId).select("email username profileImage");
        return user;
    }catch(e) {
        throw new Error(e.message);
    }
}

const adminGetUserPayments = async (parent, args, { req }) => {
    try {
        await adminMiddleware(req);
        const {userId} = args;
        const payments = await Payment.find({user: userId}).select("_id user status createdAt").sort({createdAt: -1});
        return payments
    }catch(e) {
        throw new Error(e.message);
    }
}

module.exports = {
    Query: {
        checkIsAdmin,
        adminGetPayments,
        adminGetSpecificPayment,
        adminGetUserProfile,
        adminGetUserPayments
    },
    Mutation: {
        addTrackingNumber,
    },
};
