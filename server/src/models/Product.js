import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["fruit", "vegetable", "grain", "dairy", "other"],
      default: "other",
    },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: ["kg", "g", "litre", "dozen", "piece"], default: "kg" },
    pricePerUnit: { type: Number, min: 0, default: 0 },
    status: {
      type: String,
      enum: ["available", "low_stock", "out_of_stock"],
      default: "available",
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);


productSchema.pre("save", function (next) {
  if (this.quantity <= 0) this.status = "out_of_stock";
  else if (this.quantity <= 5) this.status = "low_stock";
  else this.status = "available";
  next();
});

export default mongoose.model("Product", productSchema);
