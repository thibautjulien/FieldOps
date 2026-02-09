import jwt from "jsonwebtoken";
import { login, register } from "../services/auth.service.js";
import User from "../models/User.model.js";

const { JWT_SECRET, JWT_EXPIRES } = process.env;

export async function postAuthLoginController(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Missing email or password" });

    const user = await login(email, password);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    return res.json({
      token,
      expiresIn: JWT_EXPIRES,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
}

export async function getAuthMeController(req, res) {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: ["id", "email", "name", "role"],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
}

export async function postAuthRegisterController(req, res) {
  try {
    const { name, email, password, role } = req.body;

    const newUser = await register(name, email, password, role);

    return res.status(201).json(newUser);
  } catch (err) {
    console.error(err);

    if (err.message.startsWith("UNAUTHORIZED")) {
      return res.status(401).json({ error: err.message });
    }

    if (err.message.startsWith("BAD_REQUEST")) {
      return res.status(400).json({ error: err.message });
    }

    res.status(500).json({ error: "Internal error" });
  }
}
