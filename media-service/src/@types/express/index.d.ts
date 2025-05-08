import { Request } from "express";
import Redis from "ioredis";

declare global {
  namespace Express {
    interface Request {
      redisClient: Redis;
      user?: {
        userId: string;
      };
    }
  }
}

// This makes the file a module (by adding export)

module={}