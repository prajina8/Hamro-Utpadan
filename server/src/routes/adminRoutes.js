import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  createUser,
  listUsers,
  setUserStatus,
  resetPassword,
} from "../controllers/adminController.js";

const router = express.Router();


router.use(protect, authorize("admin"));

router.post("/users", createUser);
router.get("/users", listUsers);
router.patch("/users/:id/status", setUserStatus);
router.patch("/users/:id/reset-password", resetPassword);

export default router;
