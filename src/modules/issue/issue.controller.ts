import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import type { TQuery, TUser } from "./issue.interface";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

const createIssue = catchAsync(
    async (req: Request, res: Response) => {

        const reporter_id = req.user?.id;

        const result = await issueService.createIssueIntoDB(req.body, reporter_id as number);

        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: 'Issue created successfully',
            data: result.rows[0]
        })
}
);

const getAllIssues = catchAsync(
    async (req: Request, res: Response) => {
        const result = await issueService.getAllIssuesFromDB(req.query as TQuery);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            data: result
        })
}
);

const getSingleIssue = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const result = await issueService.getSingleIssueFromDB(id as string);

        sendResponse(res, {
            statusCode: 200,
            success: true,
            data: result
        })
}
);


const updateIssue = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const result = await issueService.updateIssueInDB(id as string, req.body, req.user as TUser);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Issue updated successfully',
            data: result
        })
}

);

const deleteIssue = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const result = await issueService.deleteIssueFromDB(id as string, req.user as TUser);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Issue deleted successfully',
        });
}
);



export const issueController = {
    createIssue,
    getAllIssues,
    getSingleIssue,
    updateIssue,
    deleteIssue
}
