// models/Customer.js
import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  idNumber: { type: String, required: true, unique: true },      // SA ID = 13 digits
  accountNumber: { type: String, required: true, unique: true },
  AccountBalance: { type: Number, default: 25000.00 },
  AccountType: { type: String, enum: ["Savings", "Cheque", "Credit"] },
  password: { type: String, required: true },                    // hashed
  role: { type: String, enum: ["customer","employee"], default: "customer" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Customer", customerSchema);
