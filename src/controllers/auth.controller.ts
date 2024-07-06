import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  const result = await registerUser(req.body);

  if (!result.success) {
    if (result.errors) {
      // Validation errors
      return res.status(422).json({ errors: result.errors });
    } else {
      // Other registration failures
      return res.status(400).json({
        status: "Bad request",
        message: "Registration unsuccessful",
        statusCode: 400
      });
    }
  }

  // Successful registration
  res.status(201).json({
    status: "success",
    message: "Registration successful",
    data: {
      accessToken: result.token,
      user: result.user,
    },
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await loginUser(email, password);

  if (!result.success) {
    if (result.errors) {
      // Validation errors
      return res.status(422).json({ errors: result.errors });
    } else {
      // Authentication failures
      return res.status(401).json({
        tatus: "Bad request",
        message: "Authentication failed",
        statusCode: 401
      });
    }
  }



  if (!result.user) {
    return res.status(500).json({
      status: "Internal Server Error",
      message: "User data missing in successful login result",
    });
  }

  res.status(200).json({
    status: "success",
    message: "Login successful",
    data: {
      accessToken: result.token,
      user: result.user.userId,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      email: result.user.email,
      phone: result.user.phone,
    },
  });
};
