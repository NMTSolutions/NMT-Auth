import express from "express";
import jwt from "jsonwebtoken";

import User from "../../models/user";
import NodeError from "../../utils/error";
import {
  generateRefreshToken,
  jwtSecretKey,
  tokenExpirationHours,
} from "../../utils/encryption";
import {
  APIStatusCode,
  ErrorCode,
  GenericErrorMessage,
  GenericMessage,
  ResponseStatus,
} from "../../utils/enums";

const accountLookup = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const { uuid, refreshToken } = req.body;

    if (!uuid || !refreshToken) {
      const err = new NodeError();
      err.message = GenericErrorMessage.ATTATCH_REFRESH_TOEKN_AND_UID;
      err.statusCode = APIStatusCode.BAD_REQUEST;
      err.code = ErrorCode.INVALID_DATA;
      throw err;
    }

    const user = await User.findOne(uuid, "uuid");

    if (!user) {
      const err = new NodeError();
      err.message = GenericErrorMessage.USER_NOT_FOUND;
      err.statusCode = APIStatusCode.UNAUTHORIZED;
      err.code = ErrorCode.INVALID_DATA;
      throw err;
    }

    const refreshTokenExpDate = Date.parse(
      new Date(user.refreshTokenExpiresAt as string).toISOString(),
    );

    const currentDate = Date.parse(new Date().toISOString());

    const isRefreshTokenValid =
      user.refreshToken === refreshToken && refreshTokenExpDate > currentDate;

    if (isRefreshTokenValid) {
      const token = jwt.sign(
        { uuid: user.uuid, username: user.username, email: user.email },
        jwtSecretKey,
        { expiresIn: `${tokenExpirationHours}h` },
      );

      const refreshToken = generateRefreshToken();

      const expireDate = new Date();
      expireDate.setHours(expireDate.getHours() + tokenExpirationHours);

      user.token = token;
      user.refreshToken = refreshToken;
      user.refreshTokenExpiresAt = expireDate.toISOString();

      await user.saveRefreshToken();

      const userData = { ...user, passwordHash: undefined };

      res.status(APIStatusCode.OK).send({
        message: GenericMessage.USER_ALREADY_LOGGED_IN,
        status: ResponseStatus.SUCCESS,
        user: userData,
      });
    } else {
      const err = new NodeError();
      err.message = GenericErrorMessage.INVALID_REFRESH_TOKEN;
      err.statusCode = APIStatusCode.BAD_REQUEST;
      err.code = ErrorCode.INVALID_REFRESH_TOKEN;
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

export default accountLookup;
