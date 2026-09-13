import Product from "../models/Product.js";
import { pushNotification } from "./notificationController.js";

export const getProducts = async (req, res) => {
  try {
    const filter = req.user.role === "farmer" ? { farmer: req.user._id } : {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;

    const products = await Product.find(filter)
      .sort({ updatedAt: -1 })
      .populate("farmer", "name phone location");

    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch products", error: error.message });
  }
};


export const createProduct = async (req, res) => {
  try {
    const { name, category, quantity, unit, pricePerUnit, notes } = req.body;
    if (!name || quantity === undefined) {
      return res.status(400).json({ message: "Product name and quantity are required" });
    }

    const product = await Product.create({
      farmer: req.user._id,
      name,
      category,
      quantity,
      unit,
      pricePerUnit,
      notes,
    });

    const io = req.app.get("io");
    await pushNotification(io, {
      recipientRole: "supplier",
      sender: req.user._id,
      type: "new_product",
      product: product._id,
      message: `${req.user.name} added ${quantity} ${unit || "kg"} of ${name}`,
    });

    res.status(201).json({ product });
  } catch (error) {
    res.status(500).json({ message: "Could not create product", error: error.message });
  }
};


export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (String(product.farmer) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only update your own products" });
    }

    const { name, category, quantity, unit, pricePerUnit, notes } = req.body;
    const previousQuantity = product.quantity;

    if (name !== undefined) product.name = name;
    if (category !== undefined) product.category = category;
    if (quantity !== undefined) product.quantity = quantity;
    if (unit !== undefined) product.unit = unit;
    if (pricePerUnit !== undefined) product.pricePerUnit = pricePerUnit;
    if (notes !== undefined) product.notes = notes;

    await product.save();

    const io = req.app.get("io");
    if (quantity !== undefined && quantity !== previousQuantity) {
      const type = product.status === "out_of_stock" ? "out_of_stock" : "stock_update";
      const message =
        product.status === "out_of_stock"
          ? `${product.name} from ${req.user.name} is now out of stock`
          : `${req.user.name} updated ${product.name} to ${product.quantity} ${product.unit}`;

      await pushNotification(io, {
        recipientRole: "supplier",
        sender: req.user._id,
        type,
        product: product._id,
        message,
      });
    }

    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: "Could not update product", error: error.message });
  }
};

// DELETE /api/products/:id  (farmer only, must own the product)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (String(product.farmer) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only remove your own products" });
    }
    await product.deleteOne();
    res.json({ message: "Product removed" });
  } catch (error) {
    res.status(500).json({ message: "Could not remove product", error: error.message });
  }
};

export const requestRestock = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const io = req.app.get("io");
    await pushNotification(io, {
      recipient: product.farmer,
      sender: req.user._id,
      type: "restock_request",
      product: product._id,
      message: `${req.user.name} needs more ${product.name} - current stock: ${product.quantity} ${product.unit}`,
    });

    res.json({ message: "Restock request sent to the farmer" });
  } catch (error) {
    res.status(500).json({ message: "Could not send restock request", error: error.message });
  }
};
