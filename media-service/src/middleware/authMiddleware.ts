import { NextFunction, Request, RequestHandler, Response } from "express";
import logger from "../utils/logger";


export const authenticateRequest  = (
  req: Request,
  res: Response,
  next: NextFunction
)=> {
  console.log("inside auth middle ware")
  const userId = req.headers["x-user-id"];
  console.log(userId)
  if (!userId || typeof userId !== "string") {
    logger.warn("Access attempted without userId");
     res.status(400).json({
      success: false,
      message: "Authentication required",
    });
    console.log("auth compledted")
    return
  }

  // Safely cast req to AuthReq to add user
  (req as any).user={userId};
  next();
};

