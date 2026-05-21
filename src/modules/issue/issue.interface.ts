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