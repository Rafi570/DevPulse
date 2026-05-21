import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

if (!process.env.CONNECTIONSTRING) {
  throw new Error("❌ CRITICAL DATABASE ERROR: CONNECTIONSTRING environment variable is completely missing.");
}

if (!process.env.JWT_SECRET) {
  throw new Error("❌ CRITICAL AUTH SECURITY ERROR: JWT_SECRET environment variable is missing for token signing.");
}

const config = {
  connection_string: process.env.CONNECTIONSTRING as string,
  port: process.env.PORT || 5001,
  jwt_secret: process.env.JWT_SECRET as string,
} as const; // ⚠️ EXACT FIX: 'as const' compiler types widening protect kore read-only fixed string type wrapper ready korbe

export default config;