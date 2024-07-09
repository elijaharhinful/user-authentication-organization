require('dotenv').config();
import "reflect-metadata";
import express, { Application } from "express";
import { connectionSource } from "./database/ormconfig";
import cors from "cors";
import morgan from "morgan";
import { readdirSync } from "fs";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger";
import authRoutes from "./routes/auth.routes"; 
import organisationRoutes from "./routes/organisation.routes"; 
import userRoutes from "./routes/user.routes";

export const app: Application = express();
const PORT = process.env.PORT || 3000;

// middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

// Apply auth routes separately
// app.use("/auth", authRoutes);

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// create database connection
// connectionSource
//   .initialize()
//   .then(async () => {
//     console.log("Database Connected");
//   })
//   .catch((error) => console.log(error));


// Serve all other routes dynamically using readdirSync
const isProduction = process.env.NODE_ENV === 'production';
// const fileExtension = isProduction ? '.js' : '.ts';

// Use dynamic import for auth routes
// import(`./routes/auth.routes${fileExtension}`).then((authRoutes) => {
//   app.use("/auth", authRoutes.default || authRoutes);
// });

// const files = readdirSync("./src/routes");
// console.log("All files in routes directory:", files);

// files.forEach((file) => {
//   console.log(`Checking file: ${file}`);
//   if (file.endsWith(fileExtension) && file !== `auth.route${fileExtension}`) {
//     console.log(`Registering route: ${file}`);
//     const route = require(`./routes/${file}`);
//     app.use("/api", route.default || route);
//   }
// });

// Apply auth routes
app.use("/auth", authRoutes);
app.use("/api", organisationRoutes);
app.use("/api", userRoutes);

// Simple GET endpoint
app.get('/', (req, res) => {
  res.send('The API is working');
});

/// Only initialize if not already initialized (for tests)
if (!connectionSource.isInitialized) {
  connectionSource
    .initialize()
    .then(() => {
      console.log("Database Connected");
      startServer();
    })
    .catch((error) => console.log(error));
} else {
  startServer();
}

function startServer() {
  if (require.main === module) {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
    });
  }
}

export { connectionSource };