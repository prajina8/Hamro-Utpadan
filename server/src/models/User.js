import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["admin", "farmer", "supplier"], required: true },
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    // Which admin account issued this login - farmers/suppliers never self-register.
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    username: this.username,
    role: this.role,
    phone: this.phone,
    location: this.location,
    isActive: this.isActive,
    createdAt: this.createdAt,
  };
};

export default mongoose.model("User", userSchema);
