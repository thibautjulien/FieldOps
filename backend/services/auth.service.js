import bcrypt from "bcrypt";
import User from "../models/User.model.js";

const authService = {
  login: async (email, password) => {
    const user = await User.findOne({
      where: { email },
    });

    if (!user) return (console.log("User not found"), null);

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return (console.log("Invalid password"), null);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  },
};

export default authService;
