import jwt from "jsonwebtoken";
//isAuth controller
export const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                message: "Please login - No auth header"
            });
            return;
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(401).json({
                message: "Token missing"
            });
            return;
        }
        const decodedValue = jwt.verify(token, process.env.JWT_SECRET);
        if (!decodedValue || !decodedValue.user) {
            res.status(401).json({
                message: "Invalid token"
            });
            return;
        }
        req.user = decodedValue.user;
        next();
    }
    catch (err) {
        res.status(401).json({
            message: "Please login - JWT error"
        });
    }
};
//# sourceMappingURL=isauth.js.map