import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import type { TQuery, TUser } from "./issue.interface";
import sendResponse from "../../utils/sendResponse";

const createIssue = async (req: Request, res: Response) => {

    try {
        const reporter_id = req.user?.id;

        const result = await issueService.createIssueIntoDB(req.body, reporter_id as number);

        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: 'Issue created successfully',
            data: result.rows[0]
        })
    } catch (error: any) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: 'Error creating issue',
            errors: error
        })
    }
}

const getAllIssues = async (req: Request, res: Response) => {
    try {

        const result = await issueService.getAllIssuesFromDB(req.query as TQuery);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            data: result
        })
    } catch (error: any) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: 'Error fetching issues',
            errors: error
        })
    }
}

const getSingleIssue = async (req: Request, res: Response) => {

    try {

        const { id } = req.params;

        const result = await issueService.getSingleIssueFromDB(id as string);

        sendResponse(res, {
            statusCode: 200,
            success: true,
            data: result
        })
    } catch (error: any) {
        sendResponse(res, {
            statusCode: 404,
            success: false,
            message: 'Issue not found',
            errors: error
        })
    }

}

const updateIssue = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await issueService.updateIssueInDB(id as string, req.body, req.user as TUser);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Issue updated successfully',
            data: result
        })
    } catch (error: any) {
        sendResponse(res, {
            statusCode: 403,
            success: false,
            message: 'Forbidden Acess or Issue not found',
            errors: error
        })
    }
}


const deleteIssue = async (req: Request, res: Response) => {

    try {
        const { id } = req.params;

        const result = await issueService.deleteIssueFromDB(id as string, req.user as TUser);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Issue deleted successfully',
        });
    } catch (error: any) {
        sendResponse(res, {
            statusCode: 403,
            success: false,
            message: 'Forbidden Acess or Issue not found',
            errors: error
        })
    }
}



export const issueController = {
    createIssue,
    getAllIssues,
    getSingleIssue,
    updateIssue,
    deleteIssue
}
