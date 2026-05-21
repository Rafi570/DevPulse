import { pool } from "../../../db";
import type { TCreateIssueInput, TIssueFilterQuery, TIssueResponse } from "./issues.interface";

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

  return {
    ...createdIssue,
    reporter: reporterMeta || null
  };
};


const getAllIssuesFromDB = async (filters: any) => {
  const { sort = "newest", type, status } = filters;

  let queryText = `SELECT * FROM issues`;
  const queryValues: any[] = [];
  const whereClauses: string[] = [];

  // Dynamic conditional text parameters parsing injection
  if (type) {
    queryValues.push(type);
    whereClauses.push(`type = $${queryValues.length}`);
  }

  if (status) {
    queryValues.push(status);
    whereClauses.push(`status = $${queryValues.length}`);
  }

  if (whereClauses.length > 0) {
    queryText += ` WHERE ` + whereClauses.join(" AND ");
  }

  // Sorting metrics matrix conversion handler map
  const orderBy = sort === "oldest" ? "ASC" : "DESC";
  queryText += ` ORDER BY created_at ${orderBy};`;

  const issuesResult = await pool.query(queryText, queryValues);
  const issues = issuesResult.rows;

  if (issues.length === 0) return [];

  // BATCH IMPLEMENTATION: Array formatting target list identification mapper tracking
  const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];

  // Dynamic user data single operation loop resolution tracking logic parameters 
  const usersResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = ANY($1);`,
    [reporterIds]
  );

  const userMap = usersResult.rows.reduce((acc: any, user: any) => {
    acc[user.id] = user;
    return acc;
  }, {});

  // Transform output model array mapping sequence structure payload matching interface
  return issues.map((issue) => {
    const { reporter_id, created_at, updated_at, ...rest } = issue;
    return {
      ...rest,
      reporter: userMap[reporter_id] || null,
      created_at,
      updated_at
    };
  });
};

// 🚀 2. Get Single Issue details locator mapping
const getSingleIssueFromDB = async (id: number) => {
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1;`, [id]);
  const issue = issueResult.rows[0];

  if (!issue) return null;

  // Secondary dynamic lookup string profile reader metadata mapping
  const userResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = $1;`,
    [issue.reporter_id]
  );
  const reporterMeta = userResult.rows[0];

  const { reporter_id, created_at, updated_at, ...rest } = issue;
  return {
    ...rest,
    reporter: reporterMeta || null,
    created_at,
    updated_at
  };
};


export const IssueServices = {
  createIssueInDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
};