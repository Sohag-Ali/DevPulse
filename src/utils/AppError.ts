class AppError extends Error {
// Custom error class to include HTTP status codes
    statusCode: number;

    constructor(
        statusCode: number,
        message: string
    ) {

        super(message);

        this.statusCode = statusCode;

    }

}

export default AppError;