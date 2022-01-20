const User = require("../models/user");
const signupValidator = require("../validators/signup");
const loginValidator = require("../validators/login");
const { authMiddleware, passwordHashing, comparePassword } = require("../utils/auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { uuid } = require("uuidv4");
const shortid = require("shortid");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const options = {
    auth: {
        api_key: process.env.SENDGRID_API_KEY,
    },
};
const transporter = nodemailer.createTransport(sendgridTransport(options));

const signup = async (parent, args) => {
    try {
        const { email, password } = args.input;
        await signupValidator(args.input);
        const user = await User.findOne({ email: args.input.email }).select("verified");
        if (user && user.verified) {
            throw new Error("อีเมลได้ถูกใช้ไปแล้ว");
        } else {
            if (!user) {
                const hashed = await passwordHashing(password);
                const token = jwt.sign({ email }, process.env.JWT_VERIFICATION, {
                    expiresIn: "5m",
                });
                const username = shortid.generate();
                const newUser = new User({
                    email,
                    password: hashed,
                    username,
                    security: { otp: token },
                });
                await newUser.save();
                const mailOptions = {
                    to: [email],
                    from: process.env.LION_EMAIL,
                    subject: "Email verification",
                    html: `
                        <p>Hi, Please click the following URL to verify your email. <br /> <a href=${process.env.CLIENT_URL}/verify/${token}>${process.env.CLIENT_URL}/verify/${token}</a></p>
                    `,
                };
                await transporter.sendMail(mailOptions);
                return "โปรดตรวจสอบอีเมลของคุณเพื่อยืนยันตัวตน";
            } else {
                const hashed = await passwordHashing(password);
                user.password = hashed;
                await user.save();
                const token = jwt.sign({ email }, process.env.JWT_VERIFICATION, {
                    expiresIn: "5m",
                });
                const mailOptions = {
                    to: [email],
                    from: process.env.LION_EMAIL,
                    subject: "Email verification",
                    html: `
                            <p>Hi, Please click the following URL to verify your email. <br /> <a href=${process.env.CLIENT_URL}/>verify/${token}>${process.env.CLIENT_URL}/verify/${token}</a></p>
                        `,
                };
                transporter.sendMail(mailOptions);
                return "โปรดตรวจสอบอีเมลของคุณเพื่อยืนยันตัวตน";
            }
        }
    } catch (e) {
        throw new Error(e.message);
    }
};

const login = async (parent, args) => {
    try {
        await loginValidator(args.input);
        const { email, password } = args.input;
        const user = await User.findOne({ email, verified: true }).select(
            "_id username role profileImage email password"
        );
        if (!user) {
            throw new Error("Email not found");
        }
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            throw new Error("Password is incorrect");
        }
        const token = jwt.sign({ _id: user._id }, process.env.JWT_AUTHENTICATION, {
            expiresIn: "12h",
        });
        return {
            token,
            username: user.username,
            profileImage: user.profileImage,
            role: user.role,
        };
    } catch (e) {
        throw new Error(e.message);
    }
};

const verify = async (parent, args) => {
    try {
        const { token } = args;
        const decoded = jwt.verify(token, process.env.JWT_VERIFICATION);
        const { email } = decoded;
        const user = await User.findOne({ email }).select("verified");
        if (!user) {
            throw new Error("User not found");
        }
        if (user.verified) {
            throw new Error("User already verified");
        }
        user.verified = true;
        await user.save();
        return "Verified. Let's login";
    } catch (e) {
        throw new Error(e.message);
    }
};

const getLoggedInUserInfo = async (parent, args, { req }) => {
    try {
        const { _id } = await authMiddleware(req);
        const user = await User.findById(_id).select("username profileImage");
        if (!user) {
            throw new Error("Unauthorized");
        }
        return {
            username: user.username,
            profileImage: user.profileImage,
        };
    } catch (e) {
        throw new Error(e.message);
    }
};

module.exports = {
    Query: {
        getLoggedInUserInfo,
    },
    Mutation: {
        signup,
        login,
        verify,
    },
};
