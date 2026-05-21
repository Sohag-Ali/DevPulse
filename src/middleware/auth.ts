import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";

const auth = () => {
    return async (req: Request, res: Response, next: NextFunction) => {

        try {
            
            const token = req.headers.authorization;

            // Check if the token is present
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized access',
                });
            }

            // Verify the token and extract user information

            const decoded = jwt.verify(token as string, config.jwtSecret as string) as jwt.JwtPayload;

            const userData = await pool.query(`
                SELECT * FROM users WHERE email = $1
            `, [decoded.email]);
                
            const user = userData.rows[0];

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized access',
                });
            }

            req.user = decoded;

            next();

        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
            });
        }

    };
}

export default auth;