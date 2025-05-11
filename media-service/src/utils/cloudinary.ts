import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import logger from "./logger";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const uploadMediaToCloudinary = (file:any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        timeout: 60000
      
      },
      (error, result) => {
        if (error) {
          logger.error("Error while uploading media to Cloudinary", error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(file.buffer);
  });
};

export const deleteMediaFromCloudinary = async (publicId: string): Promise<any> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info("Media deleted successfully from cloud storage", publicId);
    return result;
  } catch (error) {
    logger.error("Error deleting media from Cloudinary", error);
    throw error;
  }
};
