import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";

const InterventionPhoto = sequelize.define("InterventionPhoto", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default InterventionPhoto;
