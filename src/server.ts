require('dotenv').config();
import "reflect-metadata";
import express, { Application } from "express";
import { connectionSource } from "./database/ormconfig";
import cors from "cors";
import morgan from "morgan";
import { readdirSync } from "fs";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger";
import authRoutes from "./routes/auth.routes"; // Import auth routes explicitly

export const app: Application = express();
const PORT = process.env.PORT || 3000;

// middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

// Apply auth routes separately
app.use("/auth", authRoutes);

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// create database connection
connectionSource
  .initialize()
  .then(async () => {
    console.log("Database Connected");
  })
  .catch((error) => console.log(error));

// Serve all other routes dynamically using readdirSync
readdirSync("./src/routes").forEach((file) => {
  if (file.endsWith(".ts") && file !== "auth.route.ts") { // Exclude auth.route.ts
    const route = require(`./routes/${file}`);
    app.use("/api", route.default || route);
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
  });
}