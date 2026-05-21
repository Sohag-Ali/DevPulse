export interface IIssue {
  title: string;
  description: string;
  type: "bug" | "feature_request";
}

export type TQuery = {
  sort?: string;
  type?: string;
  status?: string;
}

export type TUpdateIssue = {
  title?: string;
  description?: string;
  type?: "bug" | "feature_request";
}

export type TUser = {
  id: number;
  name: string;
  role: "contributor" | "maintainer";
};