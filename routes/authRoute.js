import { Router } from "express";
import {
  login,
  logout,
  refreshToken,
  register,
} from "../controllers/authController.js";

const authRoute = Router();
authRoute.post("/register", register);
authRoute.post("/login", login);
authRoute.get("/refresh", refreshToken);
authRoute.get("/logout", logout);

export default authRoute;
