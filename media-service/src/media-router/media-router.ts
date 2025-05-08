import express, { Request, Response, NextFunction } from "express";
import multer, { MulterError } from "multer";

import { uploadMedia, getAllMedias } from "../media-controller/media-controller";
import { authenticateRequest } from "../middleware/authMiddleware";
import logger from "../utils/logger";

const router = express.Router();

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
}).single("file");

router.post(
  "/upload",
  authenticateRequest,
  (req: Request, res: Response, next: NextFunction): void => {
    upload(req, res, (err: any) => {
      if (err instanceof MulterError) {
        // Multer specific errors
        logger.error("Multer error while uploading:", err);
        return res.status(400).json({
          message: "Multer error while uploading:",
          error: err.message,
          stack: err.stack,
        });
      } else if (err) {
        // Unknown errors
        logger.error("Unknown error occurred while uploading:", err);
        return res.status(500).json({
          message: "Unknown error occurred while uploading:",
          error: err.message,
          stack: err.stack,
        });
      }

      // Check if no file was uploaded
      if (!req.file) {
        return res.status(400).json({
          message: "No file found!",
        });
      }

      // Proceed to the next middleware
      next();
    });
  },
  uploadMedia
);

router.get("/get", authenticateRequest, getAllMedias);

export default router;
