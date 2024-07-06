import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwtUtils";
import { connectionSource } from "../database/ormconfig";
import { User } from "../entities/User";
import { JwtPayload } from "jsonwebtoken";

// Define a custom interface for your JWT payload
interface CustomJwtPayload extends JwtPayload {
  userId: string;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  try {
    const decoded = verifyToken(token) as CustomJwtPayload;
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ status: "error", message: "Invalid token" });
    }

    const userRepository = connectionSource.getRepository(User);
    const user = await userRepository.findOneBy({ userId: decoded.userId });
    if (!user) {
      return res.status(401).json({ status: "error", message: "User not found" });
    }

    // Extend the Request type to include the user property
    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(401).json({ status: "error", message: "Invalid token" });
  }
};