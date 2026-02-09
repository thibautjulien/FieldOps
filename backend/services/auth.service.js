import bcrypt from "bcrypt";
import User from "../models/User.model.js";

export async function login(email, password) {
  const user = await User.findOne({
    where: { email },
  });

  if (!user) return (console.log("[FieldOps] User not found"), null);

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return (console.log("[FieldOps] Invalid password"), null);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function register(name, email, password, role) {
  if (!name || !email || !password || !role) {
    throw new Error("BAD_REQUEST: Missing required fields");
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error("UNAUTHORIZED: User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
  };
}
