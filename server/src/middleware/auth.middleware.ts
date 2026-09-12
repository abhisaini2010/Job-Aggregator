import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
}

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({
        message: "JWT_SECRET is not defined",
      });
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;

    req.userId = decoded.userId;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};