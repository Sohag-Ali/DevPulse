import type { NextFunction, Request, Response } from "express";

const globalErrorHandler = (err: Error & {
    statusCode?: number;
}, req: Request, res: Response, next: NextFunction) => {
    // console.error(err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        errors: err
    });
};

export default globalErrorHandler;