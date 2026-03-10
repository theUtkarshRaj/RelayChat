import { generateToken } from "../config/generateToken.js";
import { publishTOQueue } from "../config/rabbitmq.js";
import TryCatch from "../config/tryCatch.js";
import { redisClient } from "../index.js";
import { User } from "../model/user.js";
export const loginUser = TryCatch(async (req, res) => {
    const { email } = req.body;
    //rate limiting 1 min me ek OTP
    const rateLimitKey = `otp:ratelimit:${email}`;
    const ratelimit = await redisClient.get(rateLimitKey);
    if (ratelimit) {
        res.status(429).json({
            message: "to many request please wait before requesting new OTP"
        });
        return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpKey = `otp:${email}`;
    await redisClient.set(otpKey, otp, { EX: 300 });
    await redisClient.set(rateLimitKey, "true", { EX: 60 });
    const message = {
        to: email,
        subject: "Your otp code",
        body: `Your OTP is ${otp}. It is valid for 5 mins.`
    };
    await publishTOQueue("send-otp", message);
    res.status(200).json({
        message: "Otp send to your mail"
    });
});
export const verifyUser = TryCatch(async (req, res) => {
    //fetching from user
    const { email, otp: enteredOtp } = req.body;
    if (!email || !enteredOtp) {
        res.status(400).json({
            message: "Email and OTP required"
        });
        return;
    }
    //fetching otp from redis
    const otpKey = `otp:${email}`;
    const storedOtp = await redisClient.get(otpKey);
    //Otp matching
    if (!storedOtp || storedOtp != enteredOtp) {
        res.status(400).json({
            message: "Invalid or expired OTP"
        });
        return;
    }
    //otp matched
    await redisClient.del(otpKey);
    let user = await User.findOne({ email });
    //user nhi mila then create user
    if (!user) {
        const name = email.slice(0, 8);
        user = await User.create({ name, email });
    }
    const token = generateToken(user);
    res.json({
        message: "User verified",
        user,
        token,
    });
});
//my profile
export const myProfile = TryCatch(async (req, res) => {
    const user = req.user;
    res.json(user);
});
//update name
export const updateName = TryCatch(async (req, res) => {
    const user = await User.findById(req.user?._id);
    if (!user) {
        res.status(404).json({
            message: "Please Login"
        });
        return;
    }
    user.name = req.body.name;
    await user.save();
    const token = generateToken(user);
    res.json({
        message: "User verified",
        user,
        token
    });
});
//get all users
export const getAllUsers = TryCatch(async (req, res) => {
    const users = await User.find();
    res.json(users);
});
//get a user
export const getAUser = TryCatch(async (req, res) => {
    const user = await User.findById(req.params.id);
    res.json(user);
});
//# sourceMappingURL=user.js.map