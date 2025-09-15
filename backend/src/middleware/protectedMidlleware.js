import jwt from "jsonwebtoken";
import User from "../models/user.js";
import dotenv from "dotenv"
dotenv.config();

export const protect = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};
