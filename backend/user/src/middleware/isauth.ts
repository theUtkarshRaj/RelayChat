import type { Request, Response, NextFunction } from "express";
import type { IUser } from "../model/user.js";
import jwt from "jsonwebtoken"
import type { JwtPayload } from "jsonwebtoken"

export interface AuthenticatedRequest extends Request{
    user? : IUser | null
}

//isAuth controller
export const isAuth = async(req:AuthenticatedRequest,res:Response,next:NextFunction):
Promise<void> =>{
    try{
        const authHeader = req.headers.authorization
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            res.status(401).json({
                message:"Please login - No auth header"
            })
            return
        }

        const token = authHeader.split(" ")[1]
        if (!token) {
            res.status(401).json({
                message: "Token missing"
            })
            return
        }
        const decodedValue = jwt.verify(token,process.env.JWT_SECRET as string) as JwtPayload

        if(!decodedValue || !decodedValue.user){
            res.status(401).json({
                message:"Invalid token"
            })
            return
        } 
        req.user = decodedValue.user
        next();

    }
    catch(err){
        res.status(401).json({
            message:"Please login - JWT error"
        })
    }
}



