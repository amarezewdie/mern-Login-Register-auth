import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
// Register Function
const register = async (req, res) => {
  const { name, pwd, email } = req.body;

  try {
    if (!name || !pwd || !email) {
      return res
        .status(400)
        .json({ success: false, message: "user name ,email and pwd required" });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email already in use" });
    }

    // Hash password
    const hashPassword = await bcrypt.hash(pwd, 10);

    // Create new user
    const newUser = new userModel({
      name,
      email,
      password: hashPassword,
    });
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      success: false,
      message: " server error in Registration",
    });
  }
};

const login = async (req, res) => {
  const { email, pwd } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "un authorized" });
    }
    const match = await bcrypt.compare(pwd, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "unauthorized" });
    }
    const roles = Object.values(user?.roles).filter(Boolean);
    console.log(roles);
    const accessToken = jwt.sign(
      { id: user._id, roles },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "30s",
      }
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    // Save refresh token in the database
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: 24*60* 60 * 1000,
    });
    res.status(200).json({
      success: true,
      roles,
      accessToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json("server error in login");
  }
};

const refreshToken = async (req, res) => {
  const cookies = req.cookies;
  // console.log(req.cookies);

  if (!cookies?.jwt) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }

  const refreshToken = cookies.jwt;
  //console.log(refreshToken);

  try {
    // Find the user with the refresh token in the database
    const user = await userModel.findOne({ refreshToken });
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Refresh token not found or unauthorized",
      });
    }

    // Verify the refresh token
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) {
          return res
            .status(403)
            .json({ success: false, message: "Refresh token expired" });
        }

        // get roles
        const roles = Object.values(user.roles);

        // Generate a new access token
        const accessToken = jwt.sign(
          { id: decoded.id, roles },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "30s" }
        );

        res.status(200).json({ success: true, accessToken });
      }
    );
  } catch (error) {
    console.error("Error during refresh token process:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error in refresh token" });
  }
};
//..............logout .......................//
const logout = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    return res.status(204).send(); // No content
  }

  const refreshToken = cookies.jwt;

  try {
    // Find the user with the refresh token in the database
    const user = await userModel.findOne({ refreshToken });
    if (!user) {
      res.clearCookie("jwt", { httpOnly: true });
      return res.status(204).send(); // No content
    }

    // Remove the refresh token from the database
    user.refreshToken = "";
    await user.save();

    res.clearCookie("jwt", { httpOnly: true });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ success: false, message: "Server error in logout" });
  }
};

export { register, login, refreshToken, logout };
