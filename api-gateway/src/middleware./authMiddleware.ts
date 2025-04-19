import { NextFunction, Request,Response } from "express"
import logger from "../utils/logger"
import jwt, { verify } from "jsonwebtoken"
import dotenv from"dotenv"
import { log } from "winston"

dotenv.config()
const validatToken=(req:Request,res:Response,next:NextFunction):void=>{
    const authHeader= req.headers["authorization"]
    const token= authHeader && authHeader.split(" ")[1]
    if (!token){
        logger.warn("no token availabel");
        res.status(401).json({
            success:false,
            message:"Authentication requred "

        })
        return
    }
    if(!process.env.JWT_SECRET) {
        
        logger.warn("no token avalialbe")
        res.json({
            success:false,
            message:"internal server error"
        })
        return

       
    }  
    jwt.verify(token,process.env.JWT_SECRET,(err,user)=>{
            if(err){
                logger.warn("invlaid error");
                return res.status(492).json({
                    message:"Invalid Token",
                    success:false
                })
            }
            console.log(user);
            (req as any).user=user;
            next();
    })


    }

export {validatToken}  