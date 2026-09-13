import User from "../models/User.js";
import { generatePassword } from "../utils/generateCredentials.js";

export const createUser = async (req, res) => {
  try {
    const { name, username, role, phone, location, password } = req.body;

    if (!name || !username || !role) {
      return res.status(400).json({ message: "Name, username and role are required" });
    }
    if (!["farmer", "supplier"].includes(role)) {
      return res.status(400).json({ message: "Role must be farmer or supplier" });
    }

    const existing = await User.findOne({ username: username.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "That username is already taken" });
    }

    const plainPassword = password && password.length >= 6 ? password : generatePassword();

    const user = await User.create({
      name,
      username: username.toLowerCase().trim(),
      password: plainPassword,
      role,
      phone,
      location,
      createdBy: req.user._id,
    });

    
    res.status(201).json({
      user: user.toSafeObject(),
      generatedPassword: plainPassword,
    });
  } catch (error) {
    res.status(500).json({ message: "Could not create user", error: error.message });
  }
};


export const listUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ users: users.map((u) => u.toSafeObject()) });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch users", error: error.message });
  }
};


export const setUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") {
      return res.status(400).json({ message: "Admin accounts cannot be disabled here" });
    }
    user.isActive = Boolean(isActive);
    await user.save();
    res.json({ user: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ message: "Could not update user", error: error.message });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newPassword = generatePassword();
    user.password = newPassword;
    await user.save();

    res.json({ user: user.toSafeObject(), generatedPassword: newPassword });
  } catch (error) {
    res.status(500).json({ message: "Could not reset password", error: error.message });
  }
};
