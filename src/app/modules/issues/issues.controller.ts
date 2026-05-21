import type { Response, NextFunction, RequestHandler } from "express";
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
export const getAllIssues: RequestHandler = async (req, res, next) => {
  try {
    const filters = req.query; 
    const result = await IssueServices.getAllIssuesFromDB(filters);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getSingleIssue: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await IssueServices.getSingleIssueFromDB(Number(id));

    if (!result) {
      res.status(404).json({
        success: false,
        message: "Issue tracking not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const deleteIssue: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isDeleted = await IssueServices.deleteIssueFromDB(Number(id));

    if (!isDeleted) {
      res.status(404).json({
        success: false,
        message: "Issue not found or already deleted",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
export const updateIssue: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    
    const user = (req as any).user; 

    const result = await IssueServices.updateIssueInDB(Number(id), payload, user);

    if (result.status !== 200) {
      res.status(result.status).json({
        success: false,
        message: result.message,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};



export const IssueControllers = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  deleteIssue,
  updateIssue
};