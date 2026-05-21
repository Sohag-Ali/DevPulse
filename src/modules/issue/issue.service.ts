import { pool } from "../../db";
import AppError from "../../utils/AppError";
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
    // Default sort is by newest
    const { sort = "newest", type, status } = query;
    // Build the base query
    let baseQuery = `SELECT * FROM issues`;

    //Add filtering conditions on type 
    if (type) {
        baseQuery += ` WHERE type = '${type}'`;
    }

    // Add filtering conditions on status
    if (status) {
        //type applied hole AND use korte hobe status use korte
        if (type) {
            baseQuery += ` AND status = '${status}'`;
        } else {
            baseQuery += ` WHERE status = '${status}'`;
        }
    }

    // Add sorting condition default is by newest
    if (sort === 'oldest') {
        baseQuery += ` ORDER BY created_at ASC`;
    }
    else {
        baseQuery += ` ORDER BY created_at DESC`;
    }

    const result = await pool.query(baseQuery);

    const issues = result.rows;

    const reporterIds = issues.map(issue => issue.reporter_id);

    const reporterData = await pool.query(`
        SELECT id, name, role FROM users WHERE id = ANY($1)
    `, [reporterIds]);

    const reporters = reporterData.rows;

    // Merge reporter information with issues
    const issuesWithReporterInfo = issues.map(issue => {
        //repoter id issue reported id check
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
    const issueResult = await pool.query(`
    SELECT *
    FROM issues
    WHERE id = $1
    `,[id]);

    const issue = issueResult.rows[0];

    if (!issue) {
        throw new AppError(404, "Issue not found");
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

const updateIssueInDB = async ( id: string, payload: TUpdateIssue, user: TUser) => {

    const existingIssueResult = await pool.query(`
        SELECT * FROM issues WHERE id = $1
        `,[id]);

    const existingIssue = existingIssueResult.rows[0];

    if (!existingIssue) {
        throw new AppError(404, "Issue not found");
    }

    if(user.role === "contributor"){
        if(existingIssue.reporter_id !== user.id){
            throw new AppError(403, "You are not authorized to update this issue");
        }

        if(existingIssue.status !== "open"){
            throw new AppError(400, "Only open issues can be updated");
        }
    }

    const { title, description, type } = payload;

    const result = await pool.query(`
        UPDATE issues
        SET title = COALESCE($1, title),
        description = COALESCE($2, description),
        type = COALESCE($3, type),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *
        `,[title, description, type, id]);

    return result.rows[0];

}

const deleteIssueFromDB = async (id: string, user: TUser) => {

    if(user.role !== "maintainer"){
        throw new AppError(403, "You are not authorized to delete this issue");
    }

    const result = await pool.query(`
        DELETE FROM issues
        WHERE id = $1
        RETURNING *
        `,[id]);

    return result.rows[0];

}

export const issueService = {
    createIssueIntoDB,
    getSingleIssueFromDB,
    getAllIssuesFromDB,
    updateIssueInDB,
    deleteIssueFromDB
}