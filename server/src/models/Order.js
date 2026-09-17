import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true, trim: true },
    category: { type: String, default: "other" },

    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, default: "kg" },
    pricePerUnit: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ["pending", "confirmed", "dispatched", "delivered", "cancelled"],
      default: "pending",
    },
    note: { type: String, trim: true },

   
    deliveryPartnerName: { type: String, trim: true, default: "" },
    departurePhoto: { type: String, default: null }, 
    departureAt: { type: Date, default: null },

    
    arrivalPhoto: { type: String, default: null }, 
    receivedAt: { type: Date, default: null },
    receivedNote: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

orderSchema.index({ farmer: 1, status: 1 });
orderSchema.index({ supplier: 1, status: 1 });

export default mongoose.model("Order", orderSchema);
