import User from "../models/User.model.js";

export async function getUserMeController(req, res) {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: ["email", "name", "role"],
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
}

export async function putUserMeController(req, res) {
  try {
    const userId = req.user.id;
    const { email, name } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!email && !name)
      return res.status(400).json({ error: "Missing data (email or name)" });

    if (email) user.email = email.trim().toLowerCase();
    if (name) user.name = name.trim();

    await user.save();

    return res.json({
      message: "Profil mis à jour",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
}
