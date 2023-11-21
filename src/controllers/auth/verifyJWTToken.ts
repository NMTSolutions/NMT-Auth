import express from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import NodeError from "../../utils/error";
import {
  APIStatusCode,
  ErrorCode,
  GenericErrorMessage,
} from "../../utils/enums";
import { jwtSecretKey } from "../../utils/encryption";

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

const verifyJWTToken = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    const accessToken = authHeader?.split(" ")[1];

    if (!accessToken) {
      const err = new NodeError();
      err.message = GenericErrorMessage.ATTATCH_JWT;
      err.statusCode = APIStatusCode.UNAUTHORIZED;
      err.code = ErrorCode.INVALID_REQUEST;
      throw err;
    }

    const decodedToken = jwt.verify(accessToken, jwtSecretKey) as JwtPayload & {
      uuid: string;
      username: string;
      email: string;
    };

    if (!decodedToken) {
      const err = new NodeError();
      err.message = GenericErrorMessage.JWT_NOT_AUTHENTICATED;
      err.statusCode = APIStatusCode.UNAUTHORIZED;
      err.code = ErrorCode.INVALID_JWT_TOKEN;
      throw err;
    }

    req.user = decodedToken;

    next();
  } catch (error: any) {
    if (error.statusCode) {
      next(error);
    }
    const err = new NodeError();
    err.message = GenericErrorMessage.JWT_NOT_AUTHENTICATED;
    err.statusCode = APIStatusCode.UNAUTHORIZED;
    err.code = ErrorCode.INVALID_JWT_TOKEN;
    next(err);
  }
};

export default verifyJWTToken;
