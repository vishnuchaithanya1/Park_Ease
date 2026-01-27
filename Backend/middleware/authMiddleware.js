const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // Accept both Authorization: Bearer <token> and x-auth-token header
  let token = req.header("x-auth-token");

  // If not found, try Authorization header
  if (!token) {
    const authHeader = req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7); // Remove "Bearer " prefix
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Access Denied - No Token" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || "secret123");
    req.user = verified;
    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid Token" });
  }
};
