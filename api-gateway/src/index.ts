import dotenv from "dotenv"
import express, {Request, NextFunction ,Response} from "express"
import cors from "cors"
import Redis from "ioredis"
import logger from "./utils/logger"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import {RedisStore} from "rate-limit-redis"
import proxy from "express-http-proxy"
import errorHandler from "./middleware./erroHandler"
import { validatToken } from "./middleware./authMiddleware"
import promClient from "prom-client"
dotenv.config()



const app= express();



//registery
const register=new promClient.Registry();

promClient.collectDefaultMetrics({register})

const httprequest=new promClient.Counter({
  name:"http_request",
  help:"Total number of request",
  labelNames:["method","route","status","user_agent"]
})
register.registerMetric(httprequest)



//promuthus
app.get("/metrics", async (req: Request, res: Response) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics()); // Call the metrics function
});




//reddis connection
const redisClient = new Redis(process.env.REDIS_URL || "redis://redis:6379")

redisClient.on("connect",()=>{
    logger.info('reddis connected')
})
redisClient.on("error",()=>{  
    logger.error("error while connecting")
})



//ip based ratelimiting 
const ratelimit = rateLimit({
  windowMs: 15* 60 * 1000, // 15 minute
  max: 100,              // Limit each IP to 5 requests per windowMs
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

//setting up proxy for media server






//middlewares
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(ratelimit)
app.use(errorHandler)

app.use((req,res,next)=>{
  console.log(req.url)
  next();
})






const proxyOptions={
    proxyReqPathResolver:(req:any)=>{
        return req.originalUrl.replace(/^\/v1/,"/api")
    },
    proxyErrorHandler:(err:Error,res:Response,next:NextFunction)=>{
        logger.error(`proxy error ${err}`);
        res.status(500).json({
            success:false,
            message:"proxy error "
        })
    }

}






const identity_service=process.env.IDENTITY_SERVICE_URL ||"http://localhost:3001"
app.use("/v1/auth",proxy(identity_service,{
    ...proxyOptions,
   
    proxyReqOptDecorator(proxyReqOpts, srcReq) {
        proxyReqOpts.headers=proxyReqOpts.headers ||{}
        proxyReqOpts.headers["Content-Type"]="application/json"
        return proxyReqOpts
    },
    userResDecorator(proxyRes, proxyResData, userReq, userRes) {
        logger.info(`response received from Identity :${proxyRes.statusCode}`)
        return proxyResData
    },

}));


const POST_SERVICE=process.env.POST_SERVICE_URL ||"http://localhost:3002"
app.use(
  "/v1/posts",
  validatToken,
  proxy(POST_SERVICE, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers=proxyReqOpts.headers ||{}
      proxyReqOpts.headers["Content-Type"] = "application/json";
      proxyReqOpts.headers["x-user-id"] = (srcReq as any).user.userId;

      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from Post service: ${proxyRes.statusCode}`
      );

      return proxyResData;
    },
  })
);
const MEDIA_SERVICE=process.env._SERVICE_URL ||"http://localhost:3003"

app.use("/v1/media",(req,res,next)=>{
  console.log("hitting herer");
  next()
})
app.use(
  "/v1/media",
  validatToken,
  proxy(MEDIA_SERVICE, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers=proxyReqOpts.headers ||{}
      proxyReqOpts.headers["x-user-id"] = (srcReq as any).user.userId;
      if (!srcReq.headers["content-type"]?.startsWith("multipart/form-data")) {
        proxyReqOpts.headers["Content-Type"] = "application/json";
      }

      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from media service: ${proxyRes.statusCode}`
      );

      return proxyResData;
    },
    parseReqBody: false,
  })
);



const SEARCH_SERVICE=process.env.SEARCH_SERVICE_URL ||"http://localhost:3004"
app.use(
  "/v1/posts",
  validatToken,
  proxy(SEARCH_SERVICE, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers=proxyReqOpts.headers ||{}
      proxyReqOpts.headers["Content-Type"] = "application/json";
      proxyReqOpts.headers["x-user-id"] = (srcReq as any).user.userId;

      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from Post service: ${proxyRes.statusCode}`
      );

      return proxyResData;
    },
  })
);




const PORT= process.env.PORT ||3000
app.listen(PORT,()=>{
    logger.info(`api gateway runnin  on ${PORT}`)
})

