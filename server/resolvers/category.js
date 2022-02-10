const Category = require("../models/category");
const Product = require("../models/product");
const { authMiddleware, adminMiddleware } = require("../utils/auth");

const createCategory = async (parent, args, { req }) => {
    try {
        await adminMiddleware(req);
        const { category } = args.input;
        if (category.trim() === "") {
            throw new Error("Category must be provided");
        }
        const duplicate = await Category.findOne({ category: category.trim() }).select("_id");
        if (duplicate) {
            throw new Error("มีประเภทของสินสินค้านี้อยู่แล้ว");
        }
        const newCategory = new Category({ category, createdAt: Date.now() });
        await newCategory.save();
        return newCategory;
    } catch (e) {
        throw new Error(e.message);
    }
};

const updateCategory = async (parent, args, { req }) => {
    try {
        await adminMiddleware(req);
        const { categoryId, category } = args.input;
        if (category.trim() === "") {
            throw new Error("Category must be provided");
        }
        if (!categoryId.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error("Invalid user ID");
        }
        const duplicate = await Category.findOne({
            _id: { $ne: categoryId },
            category: category.trim(),
        }).select("_id");
        if (duplicate) {
            throw new Error("มีประเภทของสินสินค้านี้อยู่แล้ว");
        }
        const isExisting = await Category.findById(categoryId);
        if (!isExisting) {
            throw new Error("Category not found");
        }
        isExisting.category = category;
        await isExisting.save();
        return categoryId;
    } catch (e) {
        throw new Error(e.message);
    }
};

const deleteCategory = async (parent, args, { req }) => {
    try {
        await adminMiddleware(req);
        const categoryId = args.input;
        if (!categoryId.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error("Invalid user ID");
        }
        const category = await Category.findById(categoryId).select("_id");
        if (!category) {
            throw new Error("Category not found");
        }
        await Category.deleteOne({ _id: categoryId });
        //Do not delete product;
        return categoryId;
    } catch (e) {
        throw new Error(e.message);
    }
};

const categories = async (parent, args) => {
    try {
        const categories = await Category.find({});
        return categories;
    } catch (e) {
        throw new Error(e.message);
    }
};

const getCategory = async (parent, args) => {
    try {
        const { category } = args;
        if(category.trim() === "") {
            throw new Error("Category must be provided");
        }
        const specificCategory = await Category.findOne({category}).select("category products");
        if(!specificCategory) {
            throw new Error("Category not found");
        }
        return specificCategory;
    } catch (e) {
        throw new Error(e.message);
    }
};

const productsInCategory = async (parent, args) => {
    try {
        const { categoryId } = args;
        if(!categoryId.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error("Invalid category ID");
        }
        const products = await Product.find({ category: categoryId }).sort({ sold: -1 });
        return products;
    } catch (e) {
        throw new Error(e.message);
    }
};

module.exports = {
    Query: {
        productsInCategory,
        categories,
        getCategory
    },
    Mutation: {
        createCategory,
        updateCategory,
        deleteCategory,
    },
};
