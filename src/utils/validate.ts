import express from "express";
import { GenericErrorMessage } from "./enums";

export const isEmailValid = (email: string) => {
  const emailRegex = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  return emailRegex.test(email);
};

const validate = (req: express.Request, requestType = "login") => {
  let isError = false;
  const errorMessages: string[] = [];
  if (requestType === "signup") {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      isError = true;
      errorMessages.push(
        "Please attach required data. Required field names : [name, username, email, password]",
      );
    } else if (username.length < 8) {
      isError = true;
      errorMessages.push("Username must be atleast 8 characters long.");
    } else if (!isEmailValid(email)) {
      isError = true;
      errorMessages.push("Email is invalid.");
    } else if (password.length < 8) {
      isError = true;
      errorMessages.push("Password too short. (min 8 chars).");
    }

    return [isError, errorMessages.join(", ")] as [boolean, string];
  } else if (requestType === "login") {
    const { email, password } = req.body;

    if (!email || !password) {
      isError = true;
      errorMessages.push(GenericErrorMessage.ATTATCH_EMAIL_PW);
    } else if (!isEmailValid(email)) {
      isError = true;
      errorMessages.push("Email is invalid.");
    }

    return [isError, errorMessages.join(", ")] as [boolean, string];
  } else if (requestType === "password") {
    const { uuid, oldPassword, newPassword } = req.body;

    if (!uuid || !oldPassword || !newPassword) {
      isError = true;
      errorMessages.push(
        "Please attach required data. Required field names : [uuid, username, oldPassword, newPassword]",
      );
    } else if (newPassword.length < 8) {
      isError = true;
      errorMessages.push("Password too short. (min 8 chars).");
    }
    return [isError, errorMessages.join(", ")] as [boolean, string];
  } else return [isError, "No Error Message."] as [boolean, string];
};

export default validate;
