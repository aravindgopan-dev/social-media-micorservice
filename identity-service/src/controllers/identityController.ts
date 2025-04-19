import { Response, Request } from "express";
import { validateRegistration, validateLogin } from "../utils/validation";
import logger from "../utils/logger";
import User from "../modals/userModal";
import RefreshToken from "../modals/refreshModal";
import { generateToken } from "../utils/generateToken";

// Register User
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error } = validateRegistration(req.body || {});
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
      return;
    }

    const { email, password, username } = req.body;

    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      logger.warn("User already exists");
      res.status(400).json({
        success: false,
        message: "User already exists",
      });
      return;
    }

    user = new User({ username, password, email });
    await user.save();
    logger.info("User saved successfully", user._id);

    const { accessToken, refreshToken } = await generateToken(user);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error("Registration failed", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Login User
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  logger.info("Login endpoint hit");

  try {
    const { error } = validateLogin(req.body || {});
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
      return;
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      logger.warn("Invalid credentials - user not found");
      res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    const isValidPassword = user.comparePassword(password);
    if (!isValidPassword) {
      logger.warn("Invalid password");
      res.status(400).json({
        success: false,
        message: "Invalid password",
      });
      return;
    }

    const { accessToken, refreshToken } = await generateToken(user);

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      userId: user._id,
    });
  } catch (error) {
    logger.error("Login failed", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Refresh Token
export const refreshTokenUser = async (req: Request, res: Response): Promise<void> => {
  logger.info("Refresh token endpoint hit");

  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      logger.warn("Refresh token missing");
      res.status(400).json({
        success: false,
        message: "Refresh token missing",
      });
      return;
    }

    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      logger.warn("Invalid or expired refresh token");
      res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
      return;
    }

    const user = await User.findById(storedToken.user);
    if (!user) {
      logger.warn("User not found");
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateToken(user);

    await RefreshToken.deleteOne({ _id: storedToken._id });

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error("Refresh token error occurred", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Logout User
export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  logger.info("Logout endpoint hit");

  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      logger.warn("Refresh token not provided");
      res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
      return;
    }

    const deleted = await RefreshToken.deleteOne({ token: refreshToken });

    if (deleted.deletedCount === 0) {
      logger.warn("Refresh token not found or already deleted");
      res.status(400).json({
        success: false,
        message: "Invalid refresh token",
      });
      return;
    }

    logger.info("User logged out successfully");
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    logger.error("Logout failed", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};