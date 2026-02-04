import express from "express";
import cors from "cors";
import { sequelize } from "./models/index.js";

// Routes
import authRouter from "./routes/auth.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("[FieldOps] Database connected successfully.");

    await sequelize.sync({ alter: true });
    console.log("[FieldOps] Database synchronized.");

    app.listen(3000, () => {
      console.log("[FieldOps] Server is running on http://localhost:3000");
    });
  } catch (error) {
    console.error("[FieldOps] Unable to start the server:", error);
  }
}

startServer();
