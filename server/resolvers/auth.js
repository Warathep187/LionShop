const User = require("../models/user");
const { signupValidator, loginValidator, sendOTPValidator, resetPasswordValidator } = require("../validators/auth");
const {
    authMiddleware,
    passwordHashing,
    comparePassword,
} = require("../utils/auth");
const jwt = require("jsonwebtoken");
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
        const user = await User.findOne({ email, verified: true }).select("password username profileImage role unreadMessage unreadNotification");
        if (!user) {
            throw new Error("ไม่พบผู้ใช้");
        }
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            throw new Error("รหัสผ่านไม่ถูก");
        }
        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_AUTHENTICATION, {
            expiresIn: "5d",
        });
        return {
            token,
            username: user.username,
            profileImage: user.profileImage,
            role: user.role,
            unreadMessage: user.unreadMessage,
            unreadNotification: user.unreadNotification,
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
            throw new Error("ไม่พบผู้ใช้");
        }
        if (user.verified) {
            throw new Error("ผู้ใช้นี้ถูกยืนยันตัวตนแล้ว");
        }
        user.verified = true;
        await user.save();
        return "ผู้ใช้ได้รับการยืนยันตัวตนแล้ว";
    } catch (e) {
        throw new Error(e.message);
    }
};

const getLoggedInUserInfo = async (parent, args, { req }) => {
    try {
        const { _id } = await authMiddleware(req);
        const user = await User.findById(_id).select(
            "username profileImage unreadMessage unreadNotification role"
        );
        if (!user) {
            throw new Error("Unauthorized");
        }
        return user;
    } catch (e) {
        throw new Error(e.message);
    }
};

const sendOTP = async (parent, args) => {
    const { email } = args.input;
    await sendOTPValidator(email);
    const user = await User.findOne({ email: email.trim() }).select("email");
    if (!user) {
        throw new Error("ไม่พบE-mailดังกล่าว");
    }
    const random = Math.floor(Math.random() * (999999 - 100000) + 100000);
    user.security.otp = random;
    user.security.expirationTime = Date.now() + 60 * 5 * 1000; // 5 minutes
    const mailOptions = {
        to: [email.trim()],
        from: process.env.LION_EMAIL,
        subject: "การรีเซ็ตรหัสผ่าน",
        html: `
            <p>Hi, Please use this OTP to reset your password. <b>${random}</b></p>
        `,
    };
    await transporter.sendMail(mailOptions);
    await user.save();
    return "โปรดตวรสอบอีเมลของคุณ, OTPนี้จะหมดอายุใน5นาที";
};

const resetPassword = async (parent, args) => {
    try {
        await resetPasswordValidator(args.input);
        const { email, password, confirm, otp } = args.input;
        const user = await User.findOne({ email: email.trim() }).select("email security");
        if (!user) {
            throw new Error("ไม่พบอีเมลดังกล่าว");
        }
        if(user.security.otp === "") {
            throw new Error("ยังไม่เคยส่งOTP");
        }
        if(user.security.otp != otp) {
            throw new Error("OTPไม่ถูกต้อง");
        }
        if(user.security.expirationTime < Date.now()) {
            user.security.otp = "",
            await user.save();
            throw new Error("OTPหมดอายุแล้ว โปรดลองใหม่อีกครั้ง");
        }
        const hashed = await passwordHashing(password);
        user.password = hashed;
        user.security.otp = "",
        await user.save();
        return "รหัสผ่านได้ถูกรีเซตแล้ว";
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
        sendOTP,
        resetPassword,
    },
};
