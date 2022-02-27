const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const authMiddleware = async (req, res) => {
    try {
        if (!req.headers.token) {
            throw new Error("Unauthorized");
        }
        const token = req.headers.token.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_AUTHENTICATION);
        if(!decoded._id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error("Unauthorized");
        }
        const user = await User.findOne({ _id: decoded._id, verified: true }).select("_id");
        if (!user) {
            throw new Error("Unauthorized");
        }
        return decoded;
    } catch (e) {
        throw new Error("Unauthorized");
    }
};

const adminMiddleware = async (req, res) => {
    try {
        if (!req.headers.token) {
            throw new Error("Access Denied");
        }
        const token = req.headers.token.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_AUTHENTICATION);
        if(!decoded._id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error("Invalid user ID");
        }
        const user = await User.findOne({ _id: decoded._id, verified: true, role: "admin" }).select("_id");
        if (!user) {
            throw new Error("Access Denied");
        }
        return decoded;
    }catch(e) {
        throw new Error(e.message);
    }
}

const passwordHashing = async (password) => {
    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(password, salt);
    return hashed;
};

const comparePassword = async (loginPassword, password) => {
    const isMatch = await bcrypt.compare(loginPassword, password);
    return isMatch;
};

module.exports = { authMiddleware, adminMiddleware, passwordHashing, comparePassword };
