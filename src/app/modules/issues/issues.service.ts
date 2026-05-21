import { pool } from "../../../db";
import type {
  TCreateIssueInput,
  TIssueFilterQuery,
  TIssueResponse,
} from "./issues.interface";

const createIssueInDB = async (
  issueData: TCreateIssueInput,
  reporterId: number,
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
    reporter: reporterMeta || null,
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
    [reporterIds],
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
      updated_at,
    };
  });
};
const getSingleIssueFromDB = async (id: number) => {
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1;`, [
    id,
  ]);
  const issue = issueResult.rows[0];

  if (!issue) return null;

  // Secondary dynamic lookup string profile reader metadata mapping
  const userResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = $1;`,
    [issue.reporter_id],
  );
  const reporterMeta = userResult.rows[0];

  const { reporter_id, created_at, updated_at, ...rest } = issue;
  return {
    ...rest,
    reporter: reporterMeta || null,
    created_at,
    updated_at,
  };
};
const deleteIssueFromDB = async (id: number): Promise<boolean> => {
  const checkIssue = await pool.query(`SELECT id FROM issues WHERE id = $1;`, [
    id,
  ]);

  if (checkIssue.rows.length === 0) {
    return false;
  }

  // Row permanently delete korar pure SQL command query
  await pool.query(`DELETE FROM issues WHERE id = $1;`, [id]);
  return true;
};
const updateIssueInDB = async (
  id: number,
  payload: { title?: string; description?: string; type?: string },
  user: { id: number; role: string },
) => {
  // ১. Prothome database theke current issue-ta tule ani validation check er jonno
  const currentIssueResult = await pool.query(
    `SELECT * FROM issues WHERE id = $1;`,
    [id],
  );
  const issue = currentIssueResult.rows[0];

  if (!issue) {
    return { status: 404, message: "Issue not found" };
  }

  // ২. Logic Check: Role Base Rule Authorization
  if (user.role === "contributor") {
    // Check ১: Nijer issue ki na?
    if (issue.reporter_id !== user.id) {
      return { status: 403, message: "You can only update your own issues" };
    }
    // Check ২: Status ki open?
    if (issue.status !== "open") {
      return {
        status: 400,
        message: "Contributors can only update issues when status is open",
      };
    }
  }

  const fields: string[] = [];
  const values: any[] = [];
  let index = 1;

  if (payload.title) {
    fields.push(`title = $${index++}`);
    values.push(payload.title);
  }
  if (payload.description) {
    fields.push(`description = $${index++}`);
    values.push(payload.description);
  }
  if (payload.type) {
    fields.push(`type = $${index++}`);
    values.push(payload.type);
  }

  if (fields.length === 0) {
    return {
      status: 400,
      message: "Please provide at least one field to update",
    };
  }

  fields.push(`updated_at = NOW()`);

  values.push(id);
  const queryText = `UPDATE issues SET ${fields.join(", ")} WHERE id = $${index} RETURNING *;`;

  const updatedResult = await pool.query(queryText, values);
  return { status: 200, data: updatedResult.rows[0] };
};

export const IssueServices = {
  createIssueInDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  deleteIssueFromDB,
  updateIssueInDB,
};
