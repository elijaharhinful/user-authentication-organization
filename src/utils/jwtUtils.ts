import jwt from "jsonwebtoken";
import { User } from "../entities/User";

const secret = process.env.JWT_SECRET || "my_jwt_secret";

export const generateToken = (user: User) => {
  return jwt.sign({ userId: user.userId, email: user.email }, secret, {
    expiresIn: "1h",
  });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, secret);
  } catch (e) {
    return null;
  }
};
