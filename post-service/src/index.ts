import mongoose, { Mongoose } from "mongoose"
import dotenv from "dotenv"
import logger from "./utils/logger";
import express, { NextFunction,Request, RequestHandler, Response } from "express"
import helmet from "helmet";
import cors from "cors"
import { RateLimiterRedis } from "rate-limiter-flexible";
import Redis from "ioredis";
import {rateLimit} from "express-rate-limit"
import { RedisStore } from 'rate-limit-redis'
import postRouter from "./post-router/post-routes"
import errorHandler from "./middleware/erroHandler";
import { authenticateRequest } from "./middleware/authMiddleware";
import connectRabbitmq from "./utils/rabbitmq";
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

app.use((req, res, next) => {
  console.log("here")
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
});



  
app.use("/api/posts",authenticateRequest as RequestHandler)

app.use("/api/posts/",(req,res,next)=>{
  req.redisClient=redisClient;
   next()

},postRouter)


app.use(errorHandler)

async function startServer() {
  try{
    await connectRabbitmq()
    app.listen(process.env.PORT ||3002,()=>{
    logger.info(`Post service running on port ${process.env.PORT||3002}`)

    });



  }
  catch(error){
    logger.error("Error while connecting")
    process.exit(1)  
  }

}
startServer();




process.on("unhandledRejection",(reason,promise)=>{
  logger.error("unhandled Rejection at",promise,reason)
})


