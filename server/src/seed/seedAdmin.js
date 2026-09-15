import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const run = async () => {
  await connectDB();

  const username = "superadmin";
  const password = "ChangeMe123!";

  const admin = await User.findOne({ username });

  if (!admin) {
    await User.create({
      name: "Super Admin",
      username,
      password,
      role: "admin",
      isActive: true,
    });

    console.log("Admin created successfully.");
  } else {
    admin.password = password;
    admin.role = "admin";
    admin.isActive = true;

    await admin.save();

    console.log("Admin password reset successfully.");
  }

  console.log("Username:", username);
  console.log("Password:", password);

  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});