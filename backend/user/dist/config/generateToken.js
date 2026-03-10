import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
console.log("JWT_SECRET from process:", process.env.JWT_SECRET);
export const generateToken = (user) => {
    if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is missing");
    }
    return jwt.sign({ user }, JWT_SECRET, { expiresIn: "15d" });
};
//# sourceMappingURL=generateToken.js.map