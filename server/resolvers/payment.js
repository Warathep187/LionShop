const Cart = require("../models/cart");
const Product = require("../models/product");
const Payment = require("../models/payment");
const { authMiddleware, adminMiddleware } = require("../utils/auth");
const { createPaymentValidator } = require("../validators/payment");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("cloudinary").v2;
const { deleteProductCache } = require("../utils/redisActions");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const updateAmountOfProducts = async (productToUpdate) => {
    try {
        if (productToUpdate.length > 0) {
            const curProduct = productToUpdate[0];
            if (curProduct.type_) {
                const productUpdated = await Product.findOneAndUpdate(
                    { _id: curProduct.product, "types.type_": curProduct.type_ },
                    {
                        $inc: {
                            "types.$.amount": -curProduct.amount,
                        },
                    },
                    {
                        new: true,
                    }
                ).select("types");
                deleteProductCache(productToUpdate._id);
                const amountOfProductNow = productUpdated.types.filter(
                    (type) => type.type_ === curProduct.type_
                )[0].amount;
                const curProductInCart = await Cart.find({
                    _id: { $ne: curProduct._id },
                    product: curProduct.product,
                    type_: curProduct.type_,
                    amount: { $gt: amountOfProductNow },
                }).select("amount");
                for (const cur of curProductInCart) {
                    cur.amount =
                        cur.amount - (cur.amount - amountOfProductNow) < 0
                            ? 0
                            : cur.amount - (cur.amount - amountOfProductNow);
                    await cur.save();
                }
            } else {
                const productUpdated = await Product.findOneAndUpdate(
                    { _id: curProduct.product },
                    {
                        $inc: {
                            "type.amount": -curProduct.amount,
                        },
                    },
                    {
                        new: true,
                    }
                ).select("type");
                deleteProductCache(productToUpdate._id);
                const amountOfProductNow = productUpdated.type.amount;
                const curProductInCart = await Cart.find({
                    _id: { $ne: curProduct._id },
                    product: curProduct.product,
                    amount: { $gt: amountOfProductNow },
                }).select("amount");
                for (const cur of curProductInCart) {
                    cur.amount =
                        cur.amount - (cur.amount - amountOfProductNow) < 0
                            ? 0
                            : cur.amount - (cur.amount - amountOfProductNow);
                    await cur.save();
                }
            }
            productToUpdate.shift();
            await updateAmountOfProducts(productToUpdate);
        }
    } catch (e) {
        throw new Error(e.message);
    }
};
const deleteProductsInCart = async (ids) => {
    try {
        await Cart.deleteMany({ _id: { $in: ids } });
    } catch (e) {
        throw new Error(e.message);
    }
};
const createPayment = async (parent, args, { req }) => {
    try {
        const { _id } = await authMiddleware(req);
        await createPaymentValidator(args.input);
        const { fullName, address, tel, image } = args.input;
        let { productList } = args.input;
        productList = productList.reduce(function (a, b) {
            if (a.indexOf(b) < 0) a.push(b);
            return a;
        }, []);
        const products = await Cart.find({ _id: { $in: productList } }).populate("product");
        for (const product of products) {
            if (product.user.toString() !== _id) {
                throw new Error("Some product does not in your cart");
            }
        }
        for (const product of products) {
            if (product.product.multipleType) {
                const focusedType = product.product.types.filter(
                    (type) => type.type_ === product.type_
                )[0];
                if (!focusedType) {
                    throw new Error(
                        "ชนิดของสินค้ามีการเปลี่ยนแปลง, โปรดลบสินค้าออกจากตะกร้าและเพิ่มใหม่"
                    );
                } else {
                    if (product.amount > focusedType.amount) {
                        throw new Error(
                            `Amount of ${product.product.name}(${product.type_}) is greater than product in stock`
                        );
                    }
                }
            } else {
                if (product.amount > product.product.type.amount) {
                    throw new Error(
                        `Amount of ${product.product.name} is greater than product in stock`
                    );
                }
            }
        }
        const result = await cloudinary.uploader.upload(image, {
            public_id: uuidv4(),
            folder: "LionShopImageStorage/slipImages",
        });
        const slipImage = {
            url: result.url,
            public_id: result.public_id,
        };
        const productsInPayment = await Cart.find({ _id: { $in: productList } }).select(
            "product type_ price amount"
        );
        const newFormat = productsInPayment.map((product) => ({
            product: product.product,
            type_: product.type_,
            price: product.price,
            amount: product.amount,
        }));
        const newPayment = new Payment({
            user: _id,
            products: newFormat,
            fullName,
            address,
            tel,
            slipImage,
            createdAt: Date.now(),
        });
        await newPayment.save();
        const productsToUpdate = await Cart.find({ _id: { $in: productList } }).select(
            "-createdAt -user"
        );
        updateAmountOfProducts(productsToUpdate);
        deleteProductsInCart(productList);
        return "Created";
    } catch (e) {
        throw new Error(e.message);
    }
};

const getPayments = async (parent, args, { req }) => {
    try {
        const { _id } = await authMiddleware(req);
        const payments = await Payment.find({ user: _id })
            .select("_id status user createdAt")
            .sort({ createdAt: -1 });
        const newPaymentsFormat = payments;
        return newPaymentsFormat;
    } catch (e) {
        throw new Error(e.message);
    }
};

const getSpecificPayment = async (parent, args, { req }) => {
    try {
        const { _id } = await authMiddleware(req);
        const { paymentId } = args.input;
        const payment = await Payment.findOne({ _id: paymentId, user: _id }).populate(
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

module.exports = {
    Query: {
        getPayments,
    },
    Mutation: {
        createPayment,
        getSpecificPayment,
    },
};
