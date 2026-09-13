import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    res.json({
      token: generateToken(user),
      user: user.toSafeObject(),
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};


export const getMe = async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
};
