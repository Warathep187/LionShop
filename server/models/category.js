const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        trim: true,
    },
    products: {
        type: Number,
        default: 0
    },
    createdAt: Date
})

module.exports = mongoose.model("Category", CategorySchema);