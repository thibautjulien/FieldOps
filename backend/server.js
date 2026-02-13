import express from "express";
import cors from "cors";
import { DataTypes } from "sequelize";
import { sequelize } from "./models/index.js";

// Routes
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import interventionsRouter from "./routes/interventions.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  return res.status(200).json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/interventions", interventionsRouter);


async function ensureSchemaUpdates() {
  const queryInterface = sequelize.getQueryInterface();
  const columns = await queryInterface.describeTable("Interventions");

  if (!columns.city_label) {
    await queryInterface.addColumn("Interventions", "city_label", {
      type: DataTypes.STRING,
      allowNull: true,
    });
    console.log("[FieldOps] Added Interventions.city_label column.");
  }
}

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("[FieldOps] Database connected successfully.");

    await sequelize.sync();
    await ensureSchemaUpdates();
    console.log("[FieldOps] Database synchronized.");

    app.listen(process.env.PORT, () => {
      console.log("[FieldOps] Server is running on http://localhost:3000");
    });
  } catch (error) {
    console.error("[FieldOps] Unable to start the server:", error);
  }
}

startServer();
