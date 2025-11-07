// seed/createEmployee.js
import { connectDB } from "../db/conn.js";
import Customer from "../models/Customer.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

async function createEmployee() {
  await connectDB();
  const exists = await Customer.findOne({ accountNumber: "EMP001" });
  if (exists) {
    console.log("Employee already exists");
    process.exit(0);
  }
  const hashed = await bcrypt.hash("EmployeePass123", 10);
  const emp = new Customer({
    fullName: "Bank Employee",
    idNumber: "0000000000000",
    accountNumber: "EMP001",
    password: hashed,
    role: "employee"
  });
  await emp.save();
  console.log("Created employee account: username: EMP001 password: EmployeePass123");
  process.exit(0);
}

createEmployee().catch(err => {
  console.error(err);
  process.exit(1);
});
