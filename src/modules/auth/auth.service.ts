import config from "../../config";
import { pool } from "../../db";
import type { IUser } from "./auth.interface";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


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

const loginUserFromDB = async (payload: { email: string, password: string }) => {

    const { email, password } = payload;

    const existingUser = await pool.query(`
        SELECT * FROM users WHERE email = $1
    `, [email]);

    const user = existingUser.rows[0];

    if (!user) {
        throw new Error("User with this email does not exist");
    }

    // Compare passwords

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new Error("Invalid password");
    }

    // Generate JWT token

    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };

    const token = jwt.sign(jwtPayload, config.jwtSecret, { expiresIn: "10d" });

    delete user.password;

    return {
        token,
        user
    };


}

export const authService = {
    createUserIntoDB,
    loginUserFromDB
}