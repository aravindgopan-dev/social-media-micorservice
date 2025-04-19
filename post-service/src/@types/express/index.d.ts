
import {Request} from "express";
import Redis from "ioredis";

declare global {
  namespace Express {
    interface Request {
      redisClient: Redis;
    }
  }
}

// This makes the file a module
