import { pool } from "../../db";
import type { IIssue } from "./issue.interface";


const createIssueIntoDB = async (issueData: IIssue, reporter_id: number) => {
    const { title, description, type } = issueData;

    const result = await pool.query(`
        INSERT INTO issues (title, description, type, reporter_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `, [title, description, type, reporter_id]);

    return result;
}

export const issueService = {
    createIssueIntoDB
}