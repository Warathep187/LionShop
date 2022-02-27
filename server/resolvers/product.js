const Category = require("../models/category");
const Product = require("../models/product");
const Comment = require("../models/comment");
const Cart = require("../models/cart");
const { adminMiddleware } = require("../utils/auth");
const { v4: uuidv4 } = require("uuid");
const { productValidator, updateProductValidator } = require("../validators/product");
const cloudinary = require("cloudinary").v2;
const { getProductCache, setProductCache, deleteProductCache } = require("../utils/redisActions");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const uploadMultipleImage = async (images, arr) => {
    const image = await cloudinary.uploader.upload(images[0], {
        public_id: uuidv4(),
        folder: "LionShopImageStorage/productImages",
    });
    images.shift();
    arr.push({
        url: image.url,
        public_id: image.public_id,
    });
    if (images.length > 0) {
        return await uploadMultipleImage(images, arr);
    } else {
        return arr;
    }
};
const createProduct = async (parent, args, { req }) => {
    try {
        await adminMiddleware(req);
        await productValidator(args.input);
        const isExisting = await Category.findOne({ _id: args.input.category }).select(
            "category products"
        );
        if (!isExisting) {
            throw new Error("Category does not exist");
        }
        const cover = await cloudinary.uploader.upload(args.input.coverImage, {
            public_id: uuidv4(),
            folder: "LionShopImageStorage/productCoverImages",
        });
        const coverImage = {
            url: cover.url,
            public_id: cover.public_id,
        };
        let images = [];
        if (args.input.images.length > 0) {
            images = await uploadMultipleImage(args.input.images, []);
        }
        const rating = {
            sumPoint: 0,
            ratings: 0,
        };
        let types;
        let type;
        if (args.input.multipleType) {
            types = args.input.types.map((t) => ({
                ...t,
                price: parseInt(t.price),
                amount: parseInt(t.amount),
            }));
        } else {
            type = {
                price: parseInt(args.input.price),
                amount: parseInt(args.input.amount),
            };
        }
        const newProduct = new Product({
            name: args.input.name,
            description: args.input.description,
            coverImage,
            images,
            category: args.input.category,
            multipleType: args.input.multipleType,
            types: args.input.multipleType ? args.input.types : [],
            type: args.input.multipleType ? { price: 0, amount: 0 } : args.input.type,
            rating,
            sold: 0,
            createdAt: Date.now(),
        });
        await newProduct.save();
        isExisting.products += 1;
        await isExisting.save();
        return `${args.input.name} created`;
    } catch (e) {
        throw new Error(e.message);
    }
};

const deleteProductData = async (product) => {
    try {
        const { coverImage, images } = product;
        await cloudinary.uploader.destroy(coverImage.public_id);
        for (const image of images) {
            await cloudinary.uploader.destroy(image.public_id);
        }
        await Category.updateOne({ _id: product.category }, { $inc: { products: -1 } });
        await Cart.deleteMany({ product: product._id });
        await Comment.deleteMany({ product: product._id });
    } catch (e) {
        console.log(e);
    }
};

const deleteProduct = async (parent, args, { req }) => {
    try {
        await adminMiddleware(req);
        const productId = args.input;
        if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error("Invalid user ID");
        }
        const product = await Product.findById(productId).select("_id coverImage images category");
        if (!product) {
            throw new Error("Product not found");
        }
        await Product.deleteOne({ _id: productId });
        deleteProductData(product);
        deleteProductCache(productId);
        return productId;
    } catch (e) {
        throw new Error(e.message);
    }
};

const recommendedProducts = async (parent, args) => {
    try {
        const products = await Product.find({}).sort({ sold: -1 }).limit(4);
        return products;
    } catch (e) {
        throw new Error(e.message);
    }
};

const newProducts = async (paren, args) => {
    try {
        const products = await Product.find({}).sort({ createdAt: -1 }).limit(4);
        return products;
    } catch (e) {
        throw new Error(e.message);
    }
};

const singleProduct = async (parent, args, { req }) => {
    try {
        const { productId } = args;
        if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error("Invalid product id");
        }
        const cache = await getProductCache(productId);
        if (cache) {
            console.log("CACHE");
            return JSON.parse(cache);
        }
        const product = await Product.findById(productId);
        console.log("FETCH");
        setProductCache(product);
        return product;
    } catch (e) {
        throw new Error(e.message);
    }
};

const search = async (parent, args) => {
    try {
        const key = new RegExp("^" + args.key, "i");
        const products = await Product.find({ name: key });
        return products;
    } catch (e) {
        throw new Error(e.message);
    }
};

const allProducts = async (parent, args, { req }) => {
    try {
        const products = await Product.find({}).sort({ createdAt: -1 });
        return products;
    } catch (e) {
        throw new Error(e.message);
    }
};

const removeImage = async (parent, args, { req }) => {
    try {
        await adminMiddleware(req);
        const { public_id, productId } = args.input;
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error("Product not found");
        }
        if (!product.images.find((image) => image.public_id === public_id)) {
            throw new Error("Image not found");
        }
        await cloudinary.uploader.destroy(public_id);
        product.images = product.images.filter((image) => image.public_id !== public_id);
        await product.save();
        deleteProductCache(productId);
        return public_id;
    } catch (e) {
        throw new Error(e.message);
    }
};

const updateAmountOfProducts = async (product) => {
    try {
        if (product.multipleType) {
            const itemsInCart = await Cart.find({ product: product._id }).select("type_ amount");
            for (const item of itemsInCart) {
                const curType = product.types.find((type) => type.type_ === item.type_);
                if (curType) {
                    item.price = curType.price;
                    if (curType.amount < item.amount) {
                        item.amount = curType.amount;
                    }
                    await item.save();
                }
            }
        } else {
            const itemsInCart = await Cart.find({ product: product._id }).select("price amount");
            for (const item of itemsInCart) {
                item.price = product.type.price;
                if (item.amount > product.type.amount) {
                    item.amount = product.type.amount;
                }
                await item.save();
            }
        }
    } catch (e) {
        console.log(e);
    }
};
const updateNewCategory = async (oldId, newId) => {
    try {
        await Category.updateOne({ _id: oldId }, { $inc: { products: -1 } });
        await Category.updateOne({ _id: newId }, { $inc: { products: 1 } });
    } catch (e) {
        console.log(e);
    }
};
const deleteOldCoverImage = async (public_id) => {
    await cloudinary.uploader.destroy(public_id);
};
const updateProduct = async (parent, args, { req }) => {
    try {
        await adminMiddleware(req);
        await updateProductValidator(args.input);
        const { _id, name, description, coverImage, images, category, multipleType, types, type } =
            args.input;
        const product = await Product.findById(_id);
        if (!product) {
            throw new Error("Product not found");
        }
        const categoryIsExisting = await Category.findById(category).select("_id");
        if (!categoryIsExisting) {
            throw new Error("Category is not exists");
        }
        if (product.category.toString() !== category.toString()) {
            updateNewCategory(product.category, category);
            product.category = category;
        }
        product.name = name;
        product.description = description;
        if (coverImage) {
            const result = await cloudinary.uploader.upload(coverImage, {
                public_id: uuidv4(),
                folder: "LionShopImageStorage/productCoverImages",
            });
            deleteOldCoverImage(product.coverImage.public_id);
            product.coverImage = {
                public_id: result.public_id,
                url: result.url,
            };
        }
        if (images.length > 0) {
            const uploaded = await uploadMultipleImage(images, []);
            let tempArray = product.images;
            tempArray.push(...uploaded);
            product.images = tempArray;
        }
        if (multipleType) {
            product.types = types.map((type) => ({
                ...type,
                price: parseInt(type.price),
                amount: parseInt(type.amount),
            }));
        } else if (!multipleType) {
            product.type = {
                price: parseInt(type.price),
                amount: parseInt(type.amount),
            };
        }
        await product.save();
        deleteProductCache(product._id);
        updateAmountOfProducts(product);
        return "Updated";
    } catch (e) {
        throw new Error(e.message);
    }
};

module.exports = {
    Query: {
        recommendedProducts,
        newProducts,
        singleProduct,
        search,
        allProducts,
    },
    Mutation: {
        createProduct,
        deleteProduct,
        removeImage,
        updateProduct,
    },
};
