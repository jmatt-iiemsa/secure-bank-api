// routes/auth.js
import express from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";
import { validateSignupBody } from "../middleware/validation.js";

const router = express.Router();

// REGISTER
router.post("/register", asyncHandler(async (req, res) => {
  const { fullName, idNumber, accountNumber, password } = req.body;

  // Manual validation since middleware isn't working properly
  const nameRegex = /^[A-Za-z\s]{2,50}$/;
  const idRegex = /^[0-9]{13}$/;
  const accountRegex = /^[0-9]{10,20}$/;

  if (!nameRegex.test(fullName)) {
    return res.status(400).json({ message: "Invalid full name." });
  }
  if (!idRegex.test(idNumber)) {
    return res.status(400).json({ message: "Invalid ID number." });
  }
  if (!accountRegex.test(accountNumber)) {
    return res.status(400).json({ message: "Invalid account number." });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ message: "Password too weak." });
  }

  // check duplicates by accountNumber or idNumber
  const exist = await Customer.findOne({ $or: [{ accountNumber }, { idNumber }] });
  if (exist) return res.status(409).json({ message: "Account or ID already registered" });

  const hashed = await bcrypt.hash(password, 10); // hashing + salt
  const customer = new Customer({
    fullName,
    idNumber,
    accountNumber,
    password: hashed,
    role: "customer"
  });
  await customer.save();

  return res.status(201).json({ message: "Customer registered" });
}));

// LOGIN
router.post("/login", asyncHandler(async (req, res) => {
  const { accountNumber, password } = req.body;
  if (!accountNumber || !password) return res.status(400).json({ message: "Missing credentials" });

  const user = await Customer.findOne({ accountNumber });
  if (!user) return res.status(401).json({ message: "Auth failed" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "Auth failed" });

  const payload = { sub: user._id.toString(), role: user.role, name: user.fullName };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });

  return res.json({ message: "Auth successful", token, role: user.role });
}));

export default router;
