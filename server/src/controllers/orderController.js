import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { pushNotification } from "./notificationController.js";


export const createOrder = async (req, res) => {
  try {
    const { productId, quantity, note } = req.body;
    if (!productId || quantity === undefined || Number(quantity) <= 0) {
      return res.status(400).json({ message: "A product and a valid quantity are required" });
    }

    const product = await Product.findById(productId).populate("farmer", "name");
    if (!product) return res.status(404).json({ message: "Product not found" });

    const qty = Number(quantity);
    const pricePerUnit = product.pricePerUnit || 0;

    const order = await Order.create({
      product: product._id,
      productName: product.name,
      category: product.category,
      farmer: product.farmer._id,
      supplier: req.user._id,
      quantity: qty,
      unit: product.unit,
      pricePerUnit,
      totalAmount: qty * pricePerUnit,
      note: note || "",
    });

    const io = req.app.get("io");
    await pushNotification(io, {
      recipient: product.farmer._id,
      sender: req.user._id,
      type: "order_requested",
      product: product._id,
      message: `${req.user.name} ordered ${qty} ${product.unit} of ${product.name}`,
    });

    res.status(201).json({ order });
  } catch (error) {
    res.status(500).json({ message: "Could not place the order", error: error.message });
  }
};


export const getOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === "farmer") filter.farmer = req.user._id;
    if (req.user.role === "supplier") filter.supplier = req.user._id;
    if (req.query.status) filter.status = req.query.status;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("farmer", "name phone location")
      .populate("supplier", "name phone location");

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch orders", error: error.message });
  }
};


export const confirmOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (String(order.farmer) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only confirm your own orders" });
    }
    if (order.status !== "pending") {
      return res.status(400).json({ message: "Only pending orders can be confirmed" });
    }

    order.status = "confirmed";
    await order.save();

    const io = req.app.get("io");
    await pushNotification(io, {
      recipient: order.supplier,
      sender: req.user._id,
      type: "order_confirmed",
      product: order.product,
      message: `${req.user.name} confirmed your order for ${order.quantity} ${order.unit} of ${order.productName}`,
    });

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: "Could not confirm order", error: error.message });
  }
};


export const dispatchOrder = async (req, res) => {
  try {
    const { deliveryPartnerName, photo } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (String(order.farmer) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only dispatch your own orders" });
    }
    if (order.status !== "confirmed") {
      return res.status(400).json({ message: "Confirm the order before dispatching it" });
    }
    if (!deliveryPartnerName || !deliveryPartnerName.trim()) {
      return res.status(400).json({ message: "Delivery partner name is required" });
    }

    order.status = "dispatched";
    order.deliveryPartnerName = deliveryPartnerName.trim();
    order.departurePhoto = photo || null;
    order.departureAt = new Date();
    await order.save();

    
    const product = await Product.findById(order.product);
    if (product) {
      product.quantity = Math.max(0, product.quantity - order.quantity);
      await product.save();
    }

    const io = req.app.get("io");
    await pushNotification(io, {
      recipient: order.supplier,
      sender: req.user._id,
      type: "order_dispatched",
      product: order.product,
      message: `${order.quantity} ${order.unit} of ${order.productName} is on the way with ${order.deliveryPartnerName}`,
    });

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: "Could not dispatch order", error: error.message });
  }
};


export const receiveOrder = async (req, res) => {
  try {
    const { photo, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (String(order.supplier) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only receive your own orders" });
    }
    if (order.status !== "dispatched") {
      return res.status(400).json({ message: "This order has not been dispatched yet" });
    }

    order.status = "delivered";
    order.arrivalPhoto = photo || null;
    order.receivedAt = new Date();
    order.receivedNote = note || "";
    await order.save();

    const io = req.app.get("io");
    await pushNotification(io, {
      recipient: order.farmer,
      sender: req.user._id,
      type: "order_delivered",
      product: order.product,
      message: `${req.user.name} received ${order.quantity} ${order.unit} of ${order.productName} on ${order.receivedAt.toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      })}`,
    });

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: "Could not confirm receipt", error: error.message });
  }
};


export const getAnalytics = async (req, res) => {
  try {
    const match = {};
    if (req.user.role === "farmer") match.farmer = req.user._id;
    if (req.user.role === "supplier") match.supplier = req.user._id;

    const delivered = await Order.find({ ...match, status: "delivered" }).sort({ receivedAt: -1 });

    const totalRevenue = delivered.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = delivered.length;

    const byProductMap = {};
    delivered.forEach((o) => {
      if (!byProductMap[o.productName]) {
        byProductMap[o.productName] = {
          name: o.productName,
          unit: o.unit,
          totalQuantity: 0,
          totalAmount: 0,
          orderCount: 0,
        };
      }
      const entry = byProductMap[o.productName];
      entry.totalQuantity += o.quantity;
      entry.totalAmount += o.totalAmount;
      entry.orderCount += 1;
    });

    const byProduct = Object.values(byProductMap).sort((a, b) => b.totalAmount - a.totalAmount);
    const mostDemanded = [...byProduct].sort((a, b) => b.totalQuantity - a.totalQuantity).slice(0, 5);
    const mostProfitable = byProduct.slice(0, 5);

    const recentTransactions = delivered.slice(0, 15).map((o) => ({
      id: o._id,
      productName: o.productName,
      quantity: o.quantity,
      unit: o.unit,
      pricePerUnit: o.pricePerUnit,
      totalAmount: o.totalAmount,
      receivedAt: o.receivedAt,
    }));

    const pipelineAgg = await Order.aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const pipelineCounts = pipelineAgg.reduce((acc, p) => ({ ...acc, [p._id]: p.count }), {});

    res.json({ totalRevenue, totalOrders, byProduct, mostDemanded, mostProfitable, recentTransactions, pipelineCounts });
  } catch (error) {
    res.status(500).json({ message: "Could not compute analytics", error: error.message });
  }
};
