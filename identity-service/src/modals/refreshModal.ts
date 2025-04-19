import { required } from "joi";
import mongoose from "mongoose";
import { Document } from "mongoose";

interface token extends Document {
  token: string;
  user: mongoose.Types.ObjectId;
  expiresAt: Date;
}

const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

refreshTokenSchema.index({ expiresAT: 1 }, { expireAfterSeconds: 0 });
const RefreshToken = mongoose.model<token>("RefreshToken", refreshTokenSchema);

export default RefreshToken;
