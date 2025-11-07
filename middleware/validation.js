// middleware/validation.js
import validator from "validator";

// ✅ Validate registration input
export function validateSignupBody(req, res, next) {
  const { fullName, idNumber, accountNumber, password } = req.body;

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
  if (!validator.isStrongPassword(password)) {
    return res.status(400).json({ message: "Password too weak." });
  }

  next();
}

// ✅ Validate login input
export function validateLoginBody(req, res, next) {
  const { accountNumber, password } = req.body;
  const accountRegex = /^[0-9]{10,20}$/;

  if (!accountRegex.test(accountNumber)) {
    return res.status(400).json({ message: "Invalid account number." });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Invalid password." });
  }

  next();
}

// ✅ Validate payment input
export function validatePaymentBody(req, res, next) {
  const { amount, currency, provider, swiftCode, payeeAccount } = req.body;

  // whitelist and validate input formats
  const currencyRegex = /^[A-Z]{3}$/; // e.g., USD, ZAR, EUR
  const providerRegex = /^[A-Za-z\s]{2,50}$/;
  const swiftRegex = /^[A-Z0-9]{8,11}$/; // SWIFT codes
  const accountRegex = /^[0-9]{10,20}$/;

  if (!validator.isNumeric(String(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ message: "Invalid payment amount." });
  }
  if (!currencyRegex.test(currency)) {
    return res.status(400).json({ message: "Invalid currency format." });
  }
  if (!providerRegex.test(provider)) {
    return res.status(400).json({ message: "Invalid provider name." });
  }
  if (!swiftRegex.test(swiftCode)) {
    return res.status(400).json({ message: "Invalid SWIFT code." });
  }
  if (!accountRegex.test(payeeAccount)) {
    return res.status(400).json({ message: "Invalid payee account number." });
  }

  next(); // ✅ all checks passed
}
