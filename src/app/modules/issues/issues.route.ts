import { Router } from "express";
import { getSingleIssue, IssueControllers } from "./issues.controller";
import auth from "../../../middleware/auth.middleware";


const router = Router();

// Routing syntax signature overlap avoid interface forced array parameter logic
router.post("/", auth("contributor", "maintainer") as any, IssueControllers.createIssue as any);
router.get('/', IssueControllers.getAllIssues);
router.get('/:id', IssueControllers.getSingleIssue);
router.delete('/:id', auth("maintainer") as any, IssueControllers.deleteIssue as any);
router.patch('/:id', auth("maintainer") as any, IssueControllers.updateIssue as any);
export const IssueRoutes = router;



// sdfhhhhh