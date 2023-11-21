import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../../models/user";
import NodeError from "../../utils/error";
import {
  generateRefreshToken,
  jwtSecretKey,
  tokenExpirationHours,
} from "../../utils/encryption";
import {
  GenericMessage,
  ResponseStatus,
  GenericErrorMessage,
  APIStatusCode,
  ErrorCode,
} from "../../utils/enums";
import validate from "../../utils/validate";

const login = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const { email, password } = req.body;

    const [isError, errorMessage] = validate(req, "login");

    if (isError) {
      const err = new NodeError();
      err.message = errorMessage;
      err.statusCode = APIStatusCode.BAD_REQUEST;
      err.code = ErrorCode.INVALID_DATA;
      throw err;
    }

    const user = await User.findOne(email, "email");

    if (!user) {
      const err = new NodeError();
      err.message = GenericErrorMessage.USER_NOT_FOUND;
      err.statusCode = APIStatusCode.BAD_REQUEST;
      err.code = ErrorCode.INVALID_DATA;
      throw err;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    const expireDate = new Date();
    expireDate.setHours(expireDate.getHours() + tokenExpirationHours);

    if (isPasswordValid) {
      const token = jwt.sign(
        { uuid: user.uuid, username: user.username, email: user.email },
        jwtSecretKey,
        { expiresIn: `${tokenExpirationHours}h` },
      );

      const refreshToken = generateRefreshToken();

      user.token = token;
      user.refreshToken = refreshToken;
      user.refreshTokenExpiresAt = expireDate.toISOString();

      await user.saveRefreshToken();

      const userData = { ...user, passwordHash: undefined };

      res.status(APIStatusCode.OK).send({
        status: ResponseStatus.SUCCESS,
        message: GenericMessage.USER_LOGGED_IN,
        user: userData,
      });
    } else {
      const err = new NodeError();
      err.message = GenericErrorMessage.INVALID_CREDS;
      err.statusCode = APIStatusCode.UNAUTHORIZED;
      err.code = ErrorCode.INVALID_CREDS;
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

export default login;
