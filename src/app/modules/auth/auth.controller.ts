import type { Request, Response, NextFunction } from "express";
import { AuthServices } from "./auth.service";

const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await AuthServices.signupUser(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error: any) {
    if (error.code === "23505") {
      res.status(400).json({
        success: false,
        message: "Email already exists across accounts",
      });
      return;
    }
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await AuthServices.loginUser(req.body);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message || "Authentication failed",
    });
  }
};

export const AuthControllers = {
  signup,
  login,
};