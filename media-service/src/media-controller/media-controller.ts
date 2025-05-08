import { Request, Response } from "express";
import { Media } from "../modals/media";
import { uploadMediaToCloudinary } from "../utils/cloudinary";
import logger from "../utils/logger";

export const uploadMedia = async (req: Request, res: Response): Promise<void> => {
  logger.info("Starting media upload");
  try {
    if (!req.file) {
      logger.error("No file found. Please add a file and try again!");
      res.status(400).json({
        success: false,
        message: "No file found. Please add a file and try again!",
      });
      return; // Explicitly returning void to avoid promise resolution issues
    }

    const { originalname, mimetype } = req.file;
    const userId = req.user?.userId

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized. User not found.",
      });
      return; // Explicitly returning void
    }

    logger.info(`File details: name=${originalname}, type=${mimetype}`);
    logger.info("Uploading to Cloudinary...");

    const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file);

    logger.info(`Upload successful. Public ID: ${cloudinaryUploadResult.public_id}`);

    const newlyCreatedMedia = new Media({
      publicId: cloudinaryUploadResult.public_id,
      originalName: originalname,
      mimeType: mimetype,
      url: cloudinaryUploadResult.secure_url,
      userId,
    });

    await newlyCreatedMedia.save();

    res.status(201).json({
      success: true,
      mediaId: newlyCreatedMedia._id,
      url: newlyCreatedMedia.url,
      message: "Media uploaded successfully",
    });
  } catch (error) {
    logger.error("Error uploading media", error);
    res.status(500).json({
      success: false,
      message: "Error uploading media",
    });
  }
};

export const getAllMedias = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return; // Explicitly returning void
    }

    const result = await Media.find({ userId });

    if (result.length === 0) {
      res.status(404).json({
        success: false,
        message: "Can't find any media for this user",
      });
      return; // Explicitly returning void
    }

    res.status(200).json({
      success: true,
      media: result,
    });
  } catch (error) {
    logger.error("Error fetching media", error);
    res.status(500).json({
      success: false,
      message: "Error fetching media",
    });
  }
};
