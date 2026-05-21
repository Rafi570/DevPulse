import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { TLoginInput, TSignupInput } from "./auth.interface";
import { pool } from "../../../db";

const signupUser = async (userData: TSignupInput) => {
  const { name, email, password, role = "contributor" } = userData;
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const query = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at, updated_at;
  `;
  const values = [name, email, hashedPassword, role];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const loginUser = async (credentials: TLoginInput) => {
  const { email, password } = credentials;

  const query = `SELECT * FROM users WHERE email = $1;`;
  const result = await pool.query(query, [email]);
  
  if (result.rows.length === 0) {
    throw new Error("Invalid email or password");
  }

  const user = result.rows[0];

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new Error("Invalid email or password");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
  };

  const token = jwt.sign(jwtPayload, process.env.JWT_SECRET || "secret_key", {
    expiresIn: "1d",
  });

  // Exclude password from response data object
  const { password: _, ...userWithoutPassword } = user;

  return {
    token,
    user: userWithoutPassword,
  };
};

export const AuthServices = {
  signupUser,
  loginUser,
};