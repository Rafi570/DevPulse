export interface TSignupInput {
  name: string;
  email: string;
  password: string;
  role?: "contributor" | "maintainer";
}

export interface TUserResponse {
  id: number;
  name: string;
  email: string;
  role: "contributor" | "maintainer";
  created_at: Date;
  updated_at: Date;
}

export interface TLoginInput {
  email: string;
  password: string;
}