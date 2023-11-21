import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../../models/user";

import NodeError from "../../utils/error";
import validate from "../../utils/validate";
import {
  generateRefreshToken,
  jwtSecretKey,
  saltRounds,
  tokenExpirationHours,
} from "../../utils/encryption";
import {
  GenericMessage,
  GenericErrorMessage,
  ResponseStatus,
  APIStatusCode,
  ErrorCode,
} from "../../utils/enums";

const signup = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const { name, username, email, password } = req.body;

    const [isError, errorMessage] = validate(req, "signup");

    if (isError) {
      const err = new NodeError();
      err.code = ErrorCode.INVALID_DATA;
      err.message = errorMessage;
      err.statusCode = APIStatusCode.BAD_REQUEST;
      throw err;
    }

    const alreadyAUserWithEmail = await User.findOne(email, "email");
    const alreadAUserWithUsername = await User.findOne(username, "username");

    if (alreadyAUserWithEmail || alreadAUserWithUsername) {
      const err = new NodeError();
      err.code = ErrorCode.DUPLICATE_ENTRY;
      err.message = GenericErrorMessage.USER_ALREADY_EXIST;
      err.statusCode = APIStatusCode.BAD_REQUEST;
      throw err;
    }

    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User(name, username, email, passwordHash);

    const expireDate = new Date();
    expireDate.setHours(expireDate.getHours() + tokenExpirationHours);

    const refreshToken = generateRefreshToken();

    user.refreshToken = refreshToken;
    user.refreshTokenExpiresAt = expireDate.toISOString();

    await user.save();

    const token = jwt.sign({ uuid: user.uuid, username, email }, jwtSecretKey, {
      expiresIn: `${tokenExpirationHours}h`,
    });

    user.token = token;

    const userData = { ...user, passwordHash: undefined };

    res.status(APIStatusCode.CREATED).send({
      status: ResponseStatus.SUCCESS,
      message: GenericMessage.USER_CREATED,
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};

export default signup;
