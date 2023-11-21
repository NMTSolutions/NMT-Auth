import { APIStatusCode, ErrorCode, GenericErrorMessage } from "./enums";

export default class NodeError extends Error {
  statusCode: APIStatusCode;
  code: ErrorCode;

  constructor(
    message: GenericErrorMessage = GenericErrorMessage.INTERNAL_SERVER_ERROR,
    statusCode = APIStatusCode.INTERNAL_SERVER_ERROR,
    code = ErrorCode.SERVER_ERROR
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}
