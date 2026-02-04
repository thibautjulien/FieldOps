import sequelize from "../database/db.js";

import User from "./User.model.js";
import Intervention from "./Intervention.model.js";
import InterventionLog from "./InterventionLog.model.js";
import InterventionPhoto from "./InterventionPhoto.model.js";

// RELATIONS

// User -> Intervention
User.hasMany(Intervention, {
  foreignKey: "assigned_user_id",
  onDelete: "RESTRICT",
});
Intervention.belongsTo(User, {
  foreignKey: "assigned_user_id",
});

// Intervention -> Photo
Intervention.hasMany(InterventionPhoto, {
  foreignKey: "intervention_id",
  onDelete: "CASCADE",
});
InterventionPhoto.belongsTo(Intervention, {
  foreignKey: "intervention_id",
});

// User -> Log
User.hasMany(InterventionLog, {
  foreignKey: "user_id",
  onDelete: "RESTRICT",
});
InterventionLog.belongsTo(User, {
  foreignKey: "user_id",
});

// Intervention -> Log
Intervention.hasMany(InterventionLog, {
  foreignKey: "intervention_id",
  onDelete: "CASCADE",
});
InterventionLog.belongsTo(Intervention, {
  foreignKey: "intervention_id",
});

export { sequelize, User, Intervention, InterventionLog, InterventionPhoto };
