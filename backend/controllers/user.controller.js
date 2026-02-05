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
    const { email } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (email) user.email = email;
    await user.save();

    return res.json({ message: "Email updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
}
