const { authMiddleware } = require("../utils/auth");
const Comment = require("../models/comment");
const Payment = require("../models/payment");
const Product = require("../models/product");
const moment = require("moment");
const { deleteProductCache } = require("../utils/redisActions");

const updatePointOfProduct = async (productId, point) => {
    try {
        const product = await Product.findOne({ _id: productId }).select("rating");
        product.rating.sumPoint += point;
        product.rating.ratings += 1;
        await product.save();
    } catch (e) {
        console.log(e);
    }
};
const comment = async (parent, args, { req }) => {
    try {
        const { _id } = await authMiddleware(req);
        const { text, rating, productId, orderId } = args.input;
        const payment = await Payment.findOne({ _id: orderId }).select(
            "products user status reviewExpirationTime"
        );
        if (!payment) {
            throw new Error("Payment not found");
        }
        if (_id !== payment.user.toString()) {
            throw new Error("Its not you payment");
        }
        if (!payment.reviewExpirationTime) {
            throw new Error("Admin does not confirm your order");
        }
        if (payment.status.cancel) {
            throw new Error("Order is alert canceled");
        }
        if (!payment.status.confirm) {
            throw new Error("Order is not confirm, please wait");
        }
        if (payment.reviewExpirationTime > moment(Date.now()).toISOString()) {
            throw new Error("ไม่สามารถคอมเมนต์สินค้านี้ได้ เนื่องจากหมดเวลาแล้ว");
        }
        const index = payment.products.findIndex((val) => val.product.toString() === productId);
        if (index === -1) {
            throw new Error("Product is not in this payment");
        }
        const curProduct = payment.products[index];
        if (curProduct.isReviewed) {
            throw new Error("You already reviewed this product");
        }
        if (text.trim().length > 512) {
            throw new Error("Comment must be less than 512 characters");
        } else if (isNaN(parseInt(rating)) || parseInt(rating) > 5 || parseInt(rating) < 1) {
            throw new Error("Invalid rating");
        }
        payment.products[index].isReviewed = true;
        await payment.save();
        const newComment = new Comment({
            user: _id,
            product: productId,
            text,
            rating,
            createdAt: Date.now(),
        });
        await newComment.save();
        updatePointOfProduct(productId, rating);
        deleteProductCache(productId);
        return "Reviewed successfully";
    } catch (e) {
        throw new Error(e.message);
    }
};

const getProductComments = async (parent, args) => {
    try {
        const { productId } = args;
        const comments = await Comment.find({ product: productId }).populate(
            "user",
            "username profileImage"
        ).sort({ createdAt: -1});
        return comments;
    } catch (e) {
        throw new Error(e.message);
    }
};

module.exports = {
    Query: {
        getProductComments,
    },
    Mutation: {
        comment,
    },
};
