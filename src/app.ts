import CookieParser from "cookie-parser";
import cors from "cors";
import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { AuthRoutes } from "./app/modules/auth/auth.route";
import { IssueRoutes } from "./app/modules/issues/issues.route";

const app: Application = express();

app.use(CookieParser());
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Express Server",
    author: "Next Level",
  });
});


app.use("/api/auth", AuthRoutes);
app.use("/api/issues", IssueRoutes);
// Global Error Handling Middleware

export default app;