// routes/accounts.js
import express from "express";
import asyncHandler from "express-async-handler";
import Customer from "../models/Customer.js";
import { authenticateJWT } from "../middleware/auth.js";

const router = express.Router();

// Get user account details
router.get("/details", authenticateJWT, asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.user.sub).select("-password");
  if (!customer) return res.status(404).json({ message: "Customer not found" });
  
  return res.json({
    fullName: customer.fullName,
    accountNumber: customer.accountNumber,
    accountType: customer.AccountType || null,
    balance: customer.AccountBalance ? customer.AccountBalance.toFixed(2) : "0.00"
  });
}));

export default router;