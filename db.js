const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in the environment.");
}

const needsSsl =
    process.env.DATABASE_URL.includes("render.com") ||
    process.env.DATABASE_URL.includes("sslmode=require") ||
    process.env.NODE_ENV === "production";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: needsSsl ? { rejectUnauthorized: false } : false
});

module.exports = pool;