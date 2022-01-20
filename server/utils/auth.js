const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const authMiddleware = async (req, res) => {
    try {
        if (!req.headers.token) {
            throw new Error("Unauthorized");
        }
        const token = req.headers.token.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_AUTHORIZATION);
        const user = await User.findOne({ _id: decoded, verified: true }).select("_id");
        if (!user) {
            throw new Error("Unauthorized");
        }
        return decoded;
    } catch (e) {
        throw new Error(e.message);
    }
};

const passwordHashing = async (password) => {
    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(password, salt);
    return hashed;
};

const comparePassword = async (loginPassword, password) => {
    const isMatch = await bcrypt.compare(loginPassword, password);
    return isMatch;
};

module.exports = { authMiddleware, passwordHashing, comparePassword };
