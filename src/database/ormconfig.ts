import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Organisation } from "../entities/Organisation";
import dotenv from "dotenv";

dotenv.config();

export const connectionSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false, // Set this to false in production
  logging: false,
  entities: [User, Organisation],
  migrations: ["dist/migrations/*.js"],
  subscribers: [],
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
});