// middleware/auth.mjs
import jwt from "jsonwebtoken";

export function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) return res.status(401).json({ message: "Missing token" });
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid or expired token" });
      req.user = decoded; // contains sub, role, name
      next();
    });
  } catch (err) {
    return res.status(401).json({ message: "Auth error" });
  }
}

export function authorizeRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Missing user info" });
    if (req.user.role !== role) return res.status(403).json({ message: "Forbidden - insufficient role" });
    next();
  };
}
