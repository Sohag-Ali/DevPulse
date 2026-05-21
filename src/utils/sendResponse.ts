import type { Response } from "express";
import type { TResponse } from "../types/responType";

const sendResponse = <T>(res: Response, data: TResponse<T>) => {
    res.status(data.statusCode).json({
        success: data.success,
        message: data.message,
        data: data.data,
        errors: data.errors
    });
};

export default sendResponse;