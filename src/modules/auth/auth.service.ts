import { pool } from "../../db";
import type { IUser } from "./auth.interface";
import bcrypt from "bcryptjs";


const createUserIntoDB = async (payload: IUser) => {
    const { name, email, password, role } = payload;



    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await pool.query(`
        SELECT * FROM users WHERE email = $1
    `, [email]);

    if (existingUser.rows.length > 0) {
        throw new Error("User with this email already exists");
    }

    const result = await pool.query(`
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, COALESCE($4, 'contributor'))
        RETURNING *
    `, [name, email, hashedPassword, role]);

    delete result.rows[0].password;

    return result;
}

export const authService = {
    createUserIntoDB
}