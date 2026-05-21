import { pool } from "../../db";
import type { IIssue, TQuery, TUpdateIssue, TUser } from "./issue.interface";


const createIssueIntoDB = async (issueData: IIssue, reporter_id: number) => {
    const { title, description, type } = issueData;

    const result = await pool.query(`
        INSERT INTO issues (title, description, type, reporter_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `, [title, description, type, reporter_id]);

    return result;
}


const getAllIssuesFromDB = async (query: TQuery) => {
    const { sort, type, status } = query;

    let baseQuery = `SELECT * FROM issues`;

    if (type) {
        baseQuery += ` WHERE type = '${type}'`;
    }

    if (status) {
        if (type) {
            baseQuery += ` AND status = '${status}'`;
        } else {
            baseQuery += ` WHERE status = '${status}'`;
        }
    }

    if (sort === 'newest') {
        baseQuery += ` ORDER BY created_at DESC`;
    }
    else {
        baseQuery += ` ORDER BY created_at ASC`;
    }

    const result = await pool.query(baseQuery);

    const issues = result.rows;

    const reporterIds = issues.map(issue => issue.reporter_id);

    const reporterData = await pool.query(`
        SELECT id, name, role FROM users WHERE id = ANY($1)
    `, [reporterIds]);

    const reporters = reporterData.rows;

    const issuesWithReporterInfo = issues.map(issue => {
        const reporter = reporters.find(r => r.id === issue.reporter_id);
        return {
            id: issue.id,
            title: issue.title,
            description: issue.description,
            type: issue.type,
            status: issue.status,

            reporter,

            created_at: issue.created_at,
            updated_at: issue.updated_at,
        }
    });
    return issuesWithReporterInfo;
}

const getSingleIssueFromDB = async (id: string) => {
    const issueResult = await pool.query(
        `
    SELECT *
    FROM issues
    WHERE id = $1
    `,
        [id]
    );

    const issue = issueResult.rows[0];

    if (!issue) {
        throw new Error("Issue not found");
    }

    const reporterResult = await pool.query(
        `
        SELECT id, name, role
        FROM users
        WHERE id = $1
        `,
        [issue.reporter_id]
    );

    const reporter = reporterResult.rows[0];


    return {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,

        reporter,

        created_at: issue.created_at,
        updated_at: issue.updated_at,
    };

}

const updateIssueInDB = async (
    id: string,
    payload: TUpdateIssue,
    user: TUser
) => {

    const existingIssueResult = await pool.query(
        `
        SELECT * FROM issues WHERE id = $1
        `,
        [id]
    );

    const existingIssue = existingIssueResult.rows[0];

    if (!existingIssue) {
        throw new Error("Issue not found");
    }

    if(user.role === "contributor"){
        if(existingIssue.reporter_id !== user.id){
            throw new Error("You are not authorized to update this issue");
        }

        if(existingIssue.status !== "open"){
            throw new Error("You can only update issues that are open");
        }
    }

    const { title, description, type } = payload;

    const result = await pool.query(
        `
        UPDATE issues
        SET title = COALESCE($1, title),
            description = COALESCE($2, description),
            type = COALESCE($3, type),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *
        `,
        [title, description, type, id]
    );

    return result.rows[0];

}

const deleteIssueFromDB = async (id: string, user: TUser) => {

    if(user.role !== "maintainer"){
        throw new Error("You are not authorized to delete this issue");
    }

    const result = await pool.query(
        `
        DELETE FROM issues
        WHERE id = $1
        RETURNING *
        `,
        [id]
    );

    return result.rows[0];

}

export const issueService = {
    createIssueIntoDB,
    getSingleIssueFromDB,
    getAllIssuesFromDB,
    updateIssueInDB,
    deleteIssueFromDB
}