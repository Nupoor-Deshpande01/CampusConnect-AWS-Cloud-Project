
import "dotenv/config";
import mysql from "mysql2/promise";

async function testConnection() {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT || 3306),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            connectTimeout: 10000,
        });

        const [rows] = await connection.query(
            "SELECT DATABASE() AS databaseName, VERSION() AS mysqlVersion"
        );

        console.log("Database connection successful!");
        console.log(rows[0]);
    } catch (error) {
        console.error("Database connection failed:", error.code || error.message);
    } finally {
        if (connection) await connection.end();
    }
}

testConnection();
