// models/Payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },         // e.g. ZAR, USD
  provider: { type: String, required: true },         // e.g. SWIFT
  recipientAccount: { type: String, required: true },
  swiftCode: { type: String, required: true },
  verified: { type: Boolean, default: false },        // employee marks verified
  submittedToSwift: { type: Boolean, default: false },// final submit flag
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Payment", paymentSchema);
