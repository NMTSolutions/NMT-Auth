import express from "express";
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

const updateDetails = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const { uuid, name, username, phone, birthDate } = req.body;

    if (!uuid) {
      const err = new NodeError();
      err.message = GenericErrorMessage.ATTATCH_UID;
      err.statusCode = APIStatusCode.BAD_REQUEST;
      err.code = ErrorCode.INVALID_DATA;
      throw err;
    }

    if (username) {
      const userWithSameUsername = await User.findOne(username, "username");
      if (userWithSameUsername && userWithSameUsername.uuid !== uuid) {
        const err = new NodeError();
        err.message = GenericErrorMessage.DUPLICATE_USERNAME;
        err.statusCode = APIStatusCode.BAD_REQUEST;
        err.code = ErrorCode.DUPLICATE_USERNAME;
        throw err;
      }
    }

    if (phone) {
      const userWithSamePhone = await User.findOne(phone, "phone");
      if (userWithSamePhone && userWithSamePhone.uuid !== uuid) {
        const err = new NodeError();
        err.message = GenericErrorMessage.DUPLICATE_PHONE;
        err.statusCode = APIStatusCode.BAD_REQUEST;
        err.code = ErrorCode.DUPLICATE_PHONE;
        throw err;
      }
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

    user.name = name ?? user.name;
    user.username = username ?? user.username;
    user.phone = phone;
    user.dateOfBirth = birthDate ?? user.dateOfBirth;

    await user.update();

    res.status(APIStatusCode.OK).json({
      status: ResponseStatus.SUCCESS,
      message: GenericMessage.USER_DETAILS_UPDATED,
    });
  } catch (error: any) {
    next(error);
  }
};

export default updateDetails;
