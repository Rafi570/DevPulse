import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config";

export type TUserRole = "contributor" | "maintainer";

export type TCustomRequest = Request & {
  user?: {
    id: number;
    name: string;
    role: TUserRole;
  };
};

const auth = (...requiredRoles: TUserRole[]) => {
  return async (req: TCustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        res.status(401).json({
          success: false,
          message: "Unauthorized access: Missing token",
        });
        return;
      }

      const token = authHeader.startsWith("Bearer ")
  ? authHeader.split(" ")[1]
  : authHeader;

if (!token) {
  res.status(401).json({
    success: false,
    message: "Unauthorized access: Token missing",
  });
  return;
}
      // Jehetu config text 'as const' freeze type parsing, tai ekhon config.jwt_secret directly strict 100% string compile state e thakbe
      const decoded = jwt.verify(token, config.jwt_secret) as unknown as {
        id: number;
        name: string;
        role: TUserRole;
      };
      
      const role = decoded.role;

      if (requiredRoles.length && !requiredRoles.includes(role)) {
        res.status(403).json({
          success: false,
          message: "Forbidden access: Insufficient role permissions",
        });
        return;
      }

      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({
        success: false,
        message: "Unauthorized access: Invalid or expired token",
      });
    }
  };
};

export default auth;