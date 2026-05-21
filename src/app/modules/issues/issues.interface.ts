export interface TCreateIssueInput {
  title: string;
  description: string;
  type: "bug" | "feature_request";
}

export interface TIssueResponse {
  id: number;
  title: string;
  description: string;
  type: "bug" | "feature_request";
  status: "open" | "in_progress" | "resolved";
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}