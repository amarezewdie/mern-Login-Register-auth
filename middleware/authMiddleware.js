import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization; 
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided, authorization denied",
      });
    }

    // Extract token from the "Bearer <token>" format
    const accessToken = authHeader.split(" ")[1];

    // Verify the token
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
       if (err) {
         if (err.name === "TokenExpiredError") {
           return res.status(403).json({
             success: false,
             message: "Token has expired, please log in again",
           });
         }
         return res.status(401).json({
           success: false,
           message: "Token verification failed",
         });
       }

      // Attach decoded token data to the request object
      req.user = decoded;
      next(); // Pass control to the next middleware
    });
  } catch (error) {
    console.error("Error in authMiddleware:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during token verification",
    });
  }
};

export default authMiddleware;
