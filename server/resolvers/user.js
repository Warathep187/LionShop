const User = require("../models/user");
const { authMiddleware } = require("../utils/auth");
const { updateProfileValidator, changePasswordValidator } = require("../validators/user");
const cloudinary = require("cloudinary").v2;
const { v4: uuidv4 } = require("uuid");
const { passwordHashing } = require("../utils/auth");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const readNotification = async (parent, args, { req }) => {
    const { _id } = await authMiddleware(req);
    await User.updateOne({ _id }, { unreadNotification: false });
    return "OK";
};

const readMessage = async (parent, args, { req }) => {
    const { _id } = await authMiddleware(req);
    await User.updateOne({ _id }, { unreadMessage: false });
    return "OK";
};

const updateProfile = async (parent, args, { req }) => {
    try {
        const { _id } = await authMiddleware(req);
        await updateProfileValidator(args.input);
        const { username, image } = args.input;
        const user = await User.findById(_id).select("username profileImage");
        if (user.username === username) {
            if (image) {
                if (user.profileImage.public_id) {
                    await cloudinary.uploader.destroy(user.profileImage.public_id);
                }
                const result = await cloudinary.uploader.upload(image, {
                    public_id: uuidv4(),
                    folder: "LionShopImageStorage/profileImages",
                });
                const newProfileImage = {
                    url: result.url,
                    public_id: result.public_id,
                };
                user.profileImage = newProfileImage;
                await user.save();
                return {
                    username,
                    profileImage: newProfileImage,
                };
            }
            throw new Error("กรอกข้อมูลใหม่ก่อนแก้ไขข้อมูล");
        } else {
            const isDuplicate = await User.findOne({ _id: { $ne: _id }, username }).select("_id");
            if (isDuplicate) {
                throw new Error("This username is already used");
            }
            if (image) {
                if (user.profileImage.public_id) {
                    await cloudinary.uploader.destroy(user.profileImage.public_id);
                }
                const result = await cloudinary.uploader.upload(image, {
                    public_id: uuidv4(),
                    folder: "LionShopImageStorage/profileImages",
                });
                const newProfileImage = {
                    url: result.url,
                    public_id: result.public_id,
                };
                user.username = username;
                user.profileImage = newProfileImage;
                await user.save();
                return {
                    username,
                    profileImage: newProfileImage,
                };
            } else {
                user.username = username;
                await user.save();
                return user;
            }
        }
    } catch (e) {
        throw new Error(e.message);
    }
};

const changePassword = async (parent, args, { req }) => {
    try {
        const { _id } = await authMiddleware(req);
        await changePasswordValidator(args.input);
        const { password } = args.input;
        const hashed = await passwordHashing(password);
        await User.updateOne({ _id }, { password: hashed });
        return "Updated!!";
    } catch (e) {
        throw new Error(e.message);
    }
};

const getProfile = async (parent, args, { req }) => {
    try {
        const { _id } = await authMiddleware(req);
        const profile = await User.findById(_id).select("email username profileImage");
        return profile;
    } catch (e) {
        throw new Error(e.message);
    }
};

module.exports = {
    Query: {
        getProfile,
    },
    Mutation: {
        readNotification,
        readMessage,
        updateProfile,
        changePassword,
    },
};
