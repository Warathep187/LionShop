const Cart = require("../models/cart");
const Product = require("../models/product");
const { authMiddleware } = require("../utils/auth");
const { addToCartValidator } = require("../validators/cart");
const generatePayload = require("promptpay-qr");
const qrcode = require("qrcode");

const ID = "PROMPT_PAY_ID";

const cart = async (parent, args, { req }) => {
    const { _id } = await authMiddleware(req);
    const productsInCart = await Cart.find({ user: _id })
        .sort({ createdAt: -1 })
        .populate("product");
    return productsInCart;
};

const addToCart = async (parent, args, { req }) => {
    try {
        const { _id } = await authMiddleware(req);
        const { price, amount } = await addToCartValidator(args.input);
        const product = await Product.findById(args.input.product).select(
            "multipleType types type"
        );
        if (!product) {
            throw new Error("Product not found");
        }
        if (product.multipleType) {
            if (!args.input.type) {
                throw new Error("Product type must be provided");
            }
            const specifiedType = product.types.filter(
                (type) => type.type_ === args.input.type && type.price === price
            );
            if (specifiedType.length === 0) {
                throw new Error("Product type or price is invalid");
            }
            if (amount > specifiedType[0].amount) {
                throw new Error(
                    "Amount that you enter is greater than amount of this product in stock"
                );
            }
        } else {
            if (product.type.price !== price) {
                throw new Error("Invalid price");
            }
            if (amount > product.type.amount) {
                throw new Error(
                    "Amount that you enter is greater than amount of this product in stock"
                );
            }
        }
        if (product.multipleType) {
            const isExisting = await Cart.findOne({
                user: _id,
                product: args.input.product,
                type_: args.input.type,
            });
            if (isExisting) {
                const specifiedType = product.types.filter(
                    (type) => type.type_ === args.input.type && type.price === price
                );
                const afterIncrease = amount + isExisting.amount;
                if (afterIncrease > specifiedType[0].amount) {
                    throw new Error(
                        "Amount that you enter is greater than amount of this product in stock"
                    );
                }
                isExisting.amount = afterIncrease;
                await isExisting.save();
                return isExisting;
            }
            const newItem = new Cart({
                user: _id,
                product: args.input.product,
                type_: args.input.type,
                price,
                amount,
                createdAt: Date.now(),
            });
            await newItem.save();
            return newItem;
        } else {
            const isExisting = await Cart.findOne({ user: _id, product: args.input.product });
            if (isExisting) {
                const afterIncrease = amount + isExisting.amount;
                if (afterIncrease > product.type.amount) {
                    throw new Error(
                        "Amount that you enter is greater than amount of this product in stock"
                    );
                }
                isExisting.amount = afterIncrease;
                await isExisting.save();
                return isExisting;
            }
            const newItem = new Cart({
                user: _id,
                product: args.input.product,
                price,
                amount,
                createdAt: Date.now(),
            });
            await newItem.save();
            return newItem;
        }
    } catch (e) {
        throw new Error(e.message);
    }
};

const itemIncrement = async (parent, args, { req }) => {
    try {
        const { _id } = await authMiddleware(req);
        const cartId = args.input;
        if (!cartId.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error("Invalid cart id");
        }
        const cart = await Cart.findOne({ _id: cartId, user: _id }).select("product amount type_");
        if (!cart) {
            throw new Error("Item not found in your cart");
        }
        const product = await Product.findById(cart.product).select("multipleType type types");
        if (product.multipleType) {
            const afterIncrease = 1 + cart.amount;
            if (afterIncrease > product.types.find((type) => type.type_ === cart.type_).amount) {
                throw new Error(
                    "Amount that you enter is greater than amount of this product in stock"
                );
            }
            cart.amount = afterIncrease;
            await cart.save();
            return cart;
        } else {
            const afterIncrease = 1 + cart.amount;
            if (afterIncrease > product.type.amount) {
                throw new Error(
                    "Amount that you enter is greater than amount of this product in stock"
                );
            }
            cart.amount = afterIncrease;
            await cart.save();
            return cart;
        }
    } catch (e) {
        throw new Error(e.message);
    }
};

const itemDecrement = async (parent, args, { req }) => {
    try {
        const { _id } = await authMiddleware(req);
        const cartId = args.input;
        if (!cartId.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error("Invalid cart id");
        }
        const cart = await Cart.findOne({ _id: cartId, user: _id });
        if (!cart) {
            throw new Error("Item not found in your cart");
        }
        const afterDecrease = cart.amount - 1;
        if (afterDecrease <= 0) {
            await Cart.deleteOne({ _id: cartId });
            cart.amount = 0;
            return cart;
        } else {
            cart.amount = afterDecrease;
            await cart.save();
            return cart;
        }
    } catch (e) {
        throw new Error(e.message);
    }
};

const removeItem = async (parent, args, { req }) => {
    try {
        const { _id } = await authMiddleware(req);
        const cartId = args.input;
        if (!cartId.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error("Invalid cart id");
        }
        const cart = await Cart.findOne({ _id: cartId, user: _id });
        if (!cart) {
            throw new Error("Item not found in your cart");
        }
        await Cart.deleteOne({ _id: cartId });
        return cartId;
    } catch (e) {
        throw new Error(e.message);
    }
};

const checkout = async (parent, args, { req }) => {
    try {
        const { _id } = await authMiddleware(req);
        let selectedProducts = args.input;
        if (!Array.isArray(selectedProducts)) {
            throw new Error("Products that you want to buy must be a list");
        }
        if (selectedProducts.length === 0) {
            throw new Error("Product is required");
        }
        for (const id of selectedProducts) {
            if (!id.match(/^[0-9a-fA-F]{24}$/)) {
                throw new Error("Invalid id");
            }
        }
        selectedProducts = selectedProducts.reduce(function (a, b) {
            if (a.indexOf(b) < 0) a.push(b);
            return a;
        }, []);
        const products = await Cart.find({ _id: { $in: selectedProducts } }).populate("product");
        for (const product of products) {
            if (product.user.toString() !== _id) {
                throw new Error("Some product does not in your cart");
            }
        }
        let result = 0
        for (const product of products) {
            if (product.product.multipleType) {
                const focusedType = product.product.types.filter(
                    (type) => type.type_ === product.type_
                )[0];
                if(!focusedType) {
                    throw new Error("ชนิดของสินค้ามีการเปลี่ยนแปลง, โปรดลบสินค้าออกจากตะกร้าและเพิ่มใหม่");
                }else {
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
            result += product.price * product.amount;
        }
        const payload = generatePayload(ID, { amount: result });
        const options = { type: "svg", color: { dark: "#000", light: "#fff" } };
        const svg = await qrcode.toString(payload, options);
        return {
            items: products,
            qrcode: svg,
        };
    } catch (e) {
        throw new Error(e.message);
    }
};

module.exports = {
    Query: {
        cart,
    },
    Mutation: {
        addToCart,
        itemIncrement,
        itemDecrement,
        removeItem,
        checkout,
    },
};
