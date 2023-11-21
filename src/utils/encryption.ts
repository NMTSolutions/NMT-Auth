import crypto from "crypto";
import NodeError from "./error";
import { GenericErrorMessage } from "./enums";

export const saltRounds = 12;

export const tokenExpirationHours = 12;

if (!process.env.JWT_SECRET_KEY) {
  throw new NodeError(GenericErrorMessage.JWT_SECRET_KEY_MISSING);
}

export const jwtSecretKey = process.env.JWT_SECRET_KEY;

export const generateRefreshToken = () => {
  const refreshToken = crypto.randomBytes(64).toString("hex");
  return refreshToken;
};
