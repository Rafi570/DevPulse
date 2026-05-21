import { pool } from "../../../db";
import type { TCreateIssueInput, TIssueResponse } from "./issues.interface";

const createIssueInDB = async (
  issueData: TCreateIssueInput, 
  reporterId: number
): Promise<any> => {
  const { title, description, type } = issueData;

  const issueQuery = `
    INSERT INTO issues (title, description, type, reporter_id, status)
    VALUES ($1, $2, $3, $4, 'open')
    RETURNING id, title, description, type, status, reporter_id, created_at, updated_at;
  `;
  const issueValues = [title, description, type, reporterId];
  const issueResult = await pool.query(issueQuery, issueValues);
  const createdIssue = issueResult.rows[0];
  const userQuery = `
    SELECT id, name, email, role 
    FROM users 
    WHERE id = $1;
  `;
  const userResult = await pool.query(userQuery, [reporterId]);
  const reporterMeta = userResult.rows[0];

  // Response mapping model direct ready kore clean structure payload pathalam
  return {
    ...createdIssue,
    reporter: reporterMeta || null
  };
};

export const IssueServices = {
  createIssueInDB,
};