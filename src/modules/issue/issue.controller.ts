import type { Request, Response } from "express";
import { pool } from "../../db";
import { issueService } from "./issue.service";
import { report } from "node:process";
import type { TQuery, TUser } from "./issue.interface";

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

const getAllIssues = async(req: Request, res: Response) => {
    try {
        
        const result = await issueService.getAllIssuesFromDB(req.query as TQuery);
            res.status(200).json({
                success: true,
                // message: 'Issues fetched successfully',
                data: result
            })
    } catch (error:any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching issues',
            data: error
        })
    }
}

const getSingleIssue = async(req: Request, res: Response) => {

    try {
        
        const { id } = req.params;

        const result = await issueService.getSingleIssueFromDB(id as string);

        res.status(200).json({
            success: true,
            message: 'Issue fetched successfully',
            data: result
        })
    } catch (error: any) {
        res.status(404).json({
            success: false,
            message: 'Issue not found',
            data: error
        })
    }

}

const updateIssue = async(req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await issueService.updateIssueInDB(id as string, req.body, req.user as TUser);
        res.status(200).json({
            success: true,
            message: 'Issue updated successfully',
            data: result
        });
    } catch (error: any) {
        res.status(404).json({
            success: false,
            message: 'Issue not found',
            data: error
        })
    }
}



export const issueController = {
    createIssue,
    getAllIssues,
    getSingleIssue,
    updateIssue
}
