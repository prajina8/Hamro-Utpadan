import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  createOrder,
  getOrders,
  confirmOrder,
  dispatchOrder,
  receiveOrder,
  getAnalytics,
} from "../controllers/orderController.js";

const router = express.Router();

router.use(protect);

router.get("/", authorize("farmer", "supplier", "admin"), getOrders);
router.get("/analytics", authorize("farmer", "supplier", "admin"), getAnalytics);
router.post("/", authorize("supplier"), createOrder);
router.patch("/:id/confirm", authorize("farmer"), confirmOrder);
router.patch("/:id/dispatch", authorize("farmer"), dispatchOrder);
router.patch("/:id/receive", authorize("supplier"), receiveOrder);

export default router;
