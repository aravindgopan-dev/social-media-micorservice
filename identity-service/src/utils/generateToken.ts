import jwt from "jsonwebtoken";
import { IUser } from "../modals/userModal";
import crypto from "crypto";
import RefreshToken from "../modals/refreshModal";
import logger from "./logger";

export const generateToken = async (user: Partial<IUser>) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret key not found");
  }

  const accessToken = jwt.sign(
    {
      userId: user._id,
      username: user.username,
    },
    secret,
    { expiresIn: "60m" },
  );

  const refreshToken = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  try {
    await RefreshToken.create({
      token: refreshToken,
      user: user._id,
      expiresAt,
    });
  } catch (error) {
    logger.error("Error creating refresh token:", error);
    throw new Error("Failed to generate refresh token");
  }

  return { accessToken, refreshToken };
};
