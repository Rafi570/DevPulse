import type { Response, NextFunction } from "express";
import type { TCustomRequest } from "../../../middleware/auth.middleware";
import { IssueServices } from "./issues.service";

const createIssue = async (
  req: TCustomRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, type } = req.body;
    const reporterId = req.user?.id;

    // Strict Assignment Rule Limits Check
    if (!title || title.trim().length > 150) {
      res.status(400).json({
        success: false,
        message: "Title is required and must not exceed 150 characters",
      });
      return;
    }

    if (!description || description.trim().length < 20) {
      res.status(400).json({
        success: false,
        message: "Description is required and must be at least 20 characters long",
      });
      return;
    }

    if (type !== "bug" && type !== "feature_request") {
      res.status(400).json({
        success: false,
        message: "Type must be either 'bug' or 'feature_request'",
      });
      return;
    }

    if (!reporterId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: Reporter context missing",
      });
      return;
    }

    // Service theke clean response object fetch kora holo (metadata soho)
    const result = await IssueServices.createIssueInDB({ title, description, type }, reporterId);

    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const IssueControllers = {
  createIssue,
};