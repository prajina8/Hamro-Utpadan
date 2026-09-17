import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.use(protect);

router.get("/", authorize("farmer", "supplier", "admin"), getProducts);
router.post("/", authorize("farmer"), createProduct);
router.patch("/:id", authorize("farmer"), updateProduct);
router.delete("/:id", authorize("farmer"), deleteProduct);

export default router;
