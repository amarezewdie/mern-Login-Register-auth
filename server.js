import express from "express";
import "dotenv/config";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import connectDb from "./config/db.js";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";

//config
const app = express();
const port = process.env.PORT || 5000;
connectDb();

//middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

//routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
