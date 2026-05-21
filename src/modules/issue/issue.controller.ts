import type { Request, Response } from "express";
import { pool } from "../../db";
import { issueService } from "./issue.service";

const createIssue = async(req: Request, res: Response) => {

    try {
        const reporter_id = req.user?.id;

        const result = await issueService.createIssueIntoDB(req.body, reporter_id as number);
        
        res.status(201).json({
            success: true,
            message: 'Issue created successfully',
            data: result.rows[0]
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error creating issue',
            data: error
        })
    }
}

export const issueController = {
    createIssue
}