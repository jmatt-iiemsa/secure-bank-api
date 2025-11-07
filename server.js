// Import required modules
import express from "express";
import https from "https";
import fs from "fs";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import csurf from "csurf";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./db/conn.js";
import authRoutes from "./routes/auth.js";
import paymentRoutes from "./routes/payments.js";
import accountRoutes from "./routes/accounts.js";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";

dotenv.config();

// Initialize express app
const app = express();

// Load SSL certificate and private key
const sslOptions = {
  key: fs.readFileSync(process.env.SSL_KEY),
  cert: fs.readFileSync(process.env.SSL_CERT),
};

// ✅ Basic Middleware Setup
app.use(express.json({ limit: '10mb' })); // JSON parsing with limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // URL encoded parsing
app.use(cookieParser());
app.use(helmet()); // Security headers
app.use(cors()); // Cross-origin protection
app.use(morgan("dev")); // Logs requests

// Security middleware - order matters
app.use(mongoSanitize()); // removes $ operators — prevents NoSQL injection
app.use(xss()); // XSS protection

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/accounts", accountRoutes);
// ✅ Rate limiting: prevent DDoS or brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
});
app.use(limiter);

// ✅ CSRF protection (anti cross-site attack)
app.use(csurf({ cookie: true }));
const csrfProtection = csurf({ cookie: true });

app.use((req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  return csrfProtection(req, res, next);
});

// ✅ Basic route to test SSL
app.get("/", (req, res) => {
  res.json({
    message: "SecureBank API is running over HTTPS 🔒",
    csrfToken: req.csrfToken(),
  });
});

// Create HTTPS server
await connectDB();

https.createServer(sslOptions, app).listen(process.env.PORT || 3000, () => {
  console.log(`✅ Secure HTTPS server running at https://localhost:${process.env.PORT || 3000}`);
});
