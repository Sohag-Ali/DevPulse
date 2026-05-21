import { Pool } from "pg";
import config from "../config";

export const pool = new Pool({
    connectionString: config.connectionString,
})

 export const initDB = async () => {
    try {
        await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    
    name VARCHAR(100) NOT NULL,
    
    email VARCHAR(150) UNIQUE NOT NULL,
    
    password TEXT NOT NULL,
    
    role VARCHAR(20) NOT NULL DEFAULT 'contributor'
    CHECK (role IN ('contributor', 'maintainer')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
      `);

        console.log('Database initialized successfully');
    } catch (error) {
        console.log(error);
    }
}