import express from "express";

import signup from "../controllers/auth/signup";
import login from "../controllers/auth/login";
import accountLookup from "../controllers/auth/accountLookup";
import updateDetails from "../controllers/auth/updateDetails";
import verifyJWTToken from "../controllers/auth/verifyJWTToken";
import updatePassword from "../controllers/auth/updatePassword";

const authRouter = express.Router();

authRouter.post("/login", login);

authRouter.post("/signup", signup);

authRouter.post("/account-lookup", accountLookup);

authRouter.post("/update-details", verifyJWTToken, updateDetails);

authRouter.post("/update-password", verifyJWTToken, updatePassword);

export default authRouter;
