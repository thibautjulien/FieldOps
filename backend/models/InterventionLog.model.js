import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";

const InterventionLog = sequelize.define("InterventionLog", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

export default InterventionLog;
