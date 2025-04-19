import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(err.stack);
  res.status(err.status || 5000).json({
    message: err.message || "internal server error",
  });
};

export default errorHandler;
