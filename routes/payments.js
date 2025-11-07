// routes/payments.js
import express from "express";
import asyncHandler from "express-async-handler";
import Payment from "../models/Payment.js";
import Customer from "../models/Customer.js";
import { authenticateJWT, authorizeRole } from "../middleware/auth.js";
import { validatePaymentBody } from "../middleware/validation.js";

const router = express.Router();

// Customer creates a payment
router.post("/", authenticateJWT, asyncHandler(async (req, res) => {
  try {
    console.log('Payment request received:', req.body);
    console.log('User:', req.user);
    
    if (!req.user || req.user.role !== "customer") {
      return res.status(403).json({ message: "Only customers can create payments" });
    }

    // Manual validation since middleware isn't working properly
    const { amount, currency, provider, swiftCode, recipientAccount } = req.body;
    
    if (!amount || !currency || !provider || !swiftCode || !recipientAccount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if customer has sufficient balance
    const customer = await Customer.findById(req.user.sub);
    if (!customer) {
      console.log('Customer not found for ID:', req.user.sub);
      return res.status(404).json({ message: "Customer not found" });
    }
    
    console.log('Customer found:', customer.fullName, 'Balance:', customer.AccountBalance);
    
    // Initialize AccountBalance if not set
    if (customer.AccountBalance === undefined || customer.AccountBalance === null) {
      await Customer.findByIdAndUpdate(req.user.sub, { AccountBalance: 25000.00 });
      customer.AccountBalance = 25000.00;
      console.log('Initialized balance to 25000');
    }
    
    // Convert amount to ZAR if needed (simplified exchange rates)
    const exchangeRates = {
      ZAR: 1,
      USD: 18.5,
      EUR: 20.2,
      GBP: 23.1
    };
    
    const amountInZAR = parseFloat(amount) * (exchangeRates[currency.toUpperCase()] || 1);
    console.log('Amount in ZAR:', amountInZAR, 'Original:', amount, 'Currency:', currency);
    
    if (customer.AccountBalance < amountInZAR) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct converted amount from customer balance
    const newBalance = customer.AccountBalance - amountInZAR;
    await Customer.findByIdAndUpdate(req.user.sub, { AccountBalance: newBalance });
    console.log('New balance after deduction:', newBalance);

    const p = new Payment({
      customerId: req.user.sub,
      amount,
      currency,
      provider,
      recipientAccount,
      swiftCode
    });
    await p.save();
    console.log('Payment saved:', p._id);
    
    return res.status(201).json({ message: "Payment submitted", paymentId: p._id });
  } catch (error) {
    console.error('Payment processing error:', error);
    return res.status(500).json({ message: "Payment processing failed", error: error.message });
  }
}));

// Customer gets their payments
router.get("/", authenticateJWT, asyncHandler(async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const payments = await Payment.find({ customerId: req.user.sub }).sort({ createdAt: -1 });
  return res.json(payments);
}));

// Employee: list all unverified transactions
router.get("/pending", authenticateJWT, authorizeRole("employee"), asyncHandler(async (req, res) => {
  const pending = await Payment.find({ verified: false });
  return res.json(pending);
}));

// Employee: verify and then submit to SWIFT
router.post("/:id/verify", authenticateJWT, authorizeRole("employee"), asyncHandler(async (req, res) => {
  const id = req.params.id;
  const p = await Payment.findById(id);
  if (!p) return res.status(404).json({ message: "Payment not found" });

  p.verified = true;
  await p.save();
  return res.json({ message: "Payment verified" });
}));

router.post("/:id/submit", authenticateJWT, authorizeRole("employee"), asyncHandler(async (req, res) => {
  const id = req.params.id;
  const p = await Payment.findById(id);
  if (!p) return res.status(404).json({ message: "Payment not found" });
  if (!p.verified) return res.status(400).json({ message: "Must verify first" });

  p.submittedToSwift = true; // simulate SWIFT send
  await p.save();
  return res.json({ message: "Submitted to SWIFT (simulated)" });
}));

export default router;
