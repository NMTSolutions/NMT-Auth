import express from "express";

import NodeError from "../../utils/error";
import {
  APIStatusCode,
  ErrorCode,
  GenericErrorMessage,
  ResponseStatus,
} from "../../utils/enums";

const errorHandler = async (
  err: NodeError,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    let message = err.message;
    switch (err.code) {
      case ErrorCode.DUPLICATE_ENTRY:
        message = GenericErrorMessage.USER_ALREADY_EXIST;
        break;
    }
    return res
      .status(err.statusCode)
      .send({ status: ResponseStatus.ERROR, errorCode: err.code, message });
  } catch (error) {
    return res.status(APIStatusCode.INTERNAL_SERVER_ERROR).send({
      status: ResponseStatus.ERROR,
      errorCode: err.code,
      message: GenericErrorMessage.INTERNAL_SERVER_ERROR,
    });
  }
};

export default errorHandler;
