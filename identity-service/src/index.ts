import mongoose, { Mongoose } from "mongoose"
import dotenv from "dotenv"
import logger from "./utils/logger";
import express, { NextFunction,Request, Response } from "express"
import helmet from "helmet";
import cors from "cors"
import { RateLimiterRedis } from "rate-limiter-flexible";
import Redis from "ioredis";
import {rateLimit} from "express-rate-limit"
import { RedisStore } from 'rate-limit-redis'
import identityRouter from "./routes/identityRouter"
import errorHandler from "./middleware/erroHandler";


dotenv.config()






const app=express()



if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => logger.info("mongodb connected"))
    .catch((error) => logger.error("mongoose connection error:", error));
} else {
  logger.error("MONGODB_URI is not defined in environment variables.");
}


const redisClient = new Redis();
redisClient.on("connect", () => {
  logger.info("redis client connected");
});

redisClient.on("error", (err) => {
  logger.error("Redis connection error:", err);
});



//middleware

app.use(helmet())
app.use(cors())
app.use(express.json())



//DDos protection and ratelimiting

const ratelimiter= new RateLimiterRedis({
    storeClient:redisClient,
    keyPrefix:"middleware",
    points:10,
    duration:1
})

app.use((req:Request,res:Response,next:NextFunction)=>{
    ratelimiter.consume(req.ip as string)
    .then(()=>next())
    .catch(()=>{
        logger.warn(`R>{ate limite hit for ip ${req.ip}`)
        res.status(429).json({
            success:false,
            message:"rate limit hited"
        })
    })
})


//ip based ratelimiting 
const sensitiveEndpointLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,              // Limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Sensitive endpoint limit exceeded for IP ${req.ip}`);
    res.status(429).json({
      success: false,
      message: "Too many requests - sensitive endpoint limit exceeded.",
    });
  },
  store: new RedisStore({
    sendCommand: (command: string, ...args: string[]): Promise<any> => {
      return redisClient.call(command, ...args);
    },
  }),
});



app.use((req:Request,res:Response,next:NextFunction)=>{
    logger.info(`received ${req.method} request to ${req.url} `)
    logger.info(`Request body ,${req.body}`)
    next()
})


app.get("/rate",sensitiveEndpointLimiter,(req:Request,res:Response)=>{
  res.send("hiiii");
})

app.use("/api/auth",identityRouter)

app.use(errorHandler)


app.listen(process.env.PORT ||3001,()=>{
    logger.info(`Identity service running on port ${process.env.PORT||3001}`)

})

process.on("unhandledRejection",(reason,promise)=>{
  logger.error("unhandled Rejection at",promise,reason)
})