import jwt from "jsonwebtoken";
import authService from "../services/auth.service.js";

const { JWT_SECRET, JWT_EXPIRES } = process.env;

export async function loginController(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing email or password" });

    const user = await authService.login(email, password);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const payload = { sub: user.id, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    return res.json({ token, expiresIn: JWT_EXPIRES, name: user.name, id: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
}
