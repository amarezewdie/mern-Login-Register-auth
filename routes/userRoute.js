import { Router } from "express";
import { getUser } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const userRoute = Router();

userRoute.get("/get", authMiddleware, getUser);
export default userRoute;
