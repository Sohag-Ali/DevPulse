import type { Request, Response } from "express"
import { authService } from "./auth.service"
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

const createUser = catchAsync(
    async (req: Request, res: Response) => {
        const result = await authService.createUserIntoDB(req.body);
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: 'User registered successfully',
            data: result.rows[0]
        })
    }
);

const loginUser = catchAsync(
    async (req: Request, res: Response) => {
        const result = await authService.loginUserFromDB(req.body);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Login successful',
            data: result
        })
    }
);

export const authController = {
    createUser,
    loginUser
}