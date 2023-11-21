import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import NodeError from "../../utils/error";
import {
  APIStatusCode,
  ErrorCode,
  GenericErrorMessage,
  GenericMessage,
  ResponseStatus,
} from "../../utils/enums";
import User from "../../models/user";
import { JwtPayload } from "jsonwebtoken";
import {
  generateRefreshToken,
  jwtSecretKey,
  saltRounds,
  tokenExpirationHours,
} from "../../utils/encryption";
import validate from "../../utils/validate";

// Extend the Request interface with a custom 'user' property
declare module "express" {
  interface Request {
    user?: JwtPayload & {
      uuid: string;
      username: string;
      email: string;
    };
  }
}

const updatePassword = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const { uuid, oldPassword, newPassword } = req.body;

    const [isError, errorMessage] = validate(req, "password");

    if (isError) {
      const err = new NodeError();
      err.message = errorMessage;
      err.statusCode = APIStatusCode.BAD_REQUEST;
      err.code = ErrorCode.INVALID_DATA;
      throw err;
    }

    const user = await User.findOne(uuid, "uuid");

    if (!user) {
      const err = new NodeError();
      err.message = GenericErrorMessage.USER_NOT_FOUND;
      err.statusCode = APIStatusCode.BAD_REQUEST;
      err.code = ErrorCode.INVALID_REQUEST;
      throw err;
    }

    if (user.uuid !== req.user?.uuid || user.email !== req.user?.email) {
      const err = new NodeError();
      err.message = GenericErrorMessage.JWT_NOT_AUTORIZED;
      err.statusCode = APIStatusCode.UNAUTHORIZED;
      err.code = ErrorCode.INVALID_REQUEST;
      throw err;
    }

    const isOldPasswordValid = await bcrypt.compare(
      oldPassword,
      user.passwordHash,
    );

    const expireDate = new Date();
    expireDate.setHours(expireDate.getHours() + tokenExpirationHours);

    if (isOldPasswordValid) {
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
      user.passwordHash = newPasswordHash;

      const token = jwt.sign(
        { username: user.username, email: user.email },
        jwtSecretKey,
        { expiresIn: `${tokenExpirationHours}h` },
      );

      const refreshToken = generateRefreshToken();

      user.token = token;
      user.refreshToken = refreshToken;
      user.refreshTokenExpiresAt = expireDate.toISOString();
      user.updatedAt = new Date().toISOString();

      await user.updatePassword();

      const userData = { ...user, passwordHash: undefined };

      res.status(APIStatusCode.CREATED).send({
        status: ResponseStatus.SUCCESS,
        message: GenericMessage.USER_PASSWORD_UPDATED,
        user: userData,
      });
    } else {
      const err = new NodeError();
      err.message = GenericErrorMessage.INVALID_CREDS;
      err.statusCode = APIStatusCode.UNAUTHORIZED;
      err.code = ErrorCode.INVALID_CREDS;
      throw err;
    }
  } catch (error: any) {
    next(error);
  }
};

export default updatePassword;
