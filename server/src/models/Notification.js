import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    

    
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    recipientRole: { type: String, enum: ["farmer", "supplier", "admin", null], default: null },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "new_product",
        "stock_update",
        "out_of_stock",
        "restock_request",
        "order_requested",
        "order_confirmed",
        "order_dispatched",
        "order_delivered",
      ],
      required: true,
    },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
