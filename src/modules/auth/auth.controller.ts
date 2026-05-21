import type { Request, Response } from "express"
import { authService } from "./auth.service"

const createUser = async( req: Request, res: Response) => {
try {

        const result = await authService.createUserIntoDB(req.body);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: result.rows[0]
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: error,
        })
    }
}

export const authController = {
  createUser
}