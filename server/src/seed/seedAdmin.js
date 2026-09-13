
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const run = async () => {
  await connectDB();

  const username = (process.env.SEED_ADMIN_USERNAME || "superadmin").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";

  const existing = await User.findOne({ username });
  if (existing) {
    console.log(`Admin "${username}" already exists - nothing to do.`);
    process.exit(0);
  }

  await User.create({
    name: "Super Admin",
    username,
    password,
    role: "admin",
  });

  console.log(`Admin account created - username: ${username}`);
  console.log("Log in from the admin app and change this password / create real admins.");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
