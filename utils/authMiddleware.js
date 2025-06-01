import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "secret_key";

export function verifyToken(handler) {
  return async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, secret);
      req.user = { id: decoded.id, role: decoded.role };
      return handler(req, res);
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
}

// For endpoints that require admin access.
export function requireAdmin(handler) {
  return verifyToken((req, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Requires admin role" });
    }
    return handler(req, res);
  });
}