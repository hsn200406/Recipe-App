const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;

  // 1. Check if token exists
  if (!authHeader) {
    return res.status(401).json({ message: "No token, access denied" });
  }

  // 2. Extract token (format: "Bearer <token>")
  const token = authHeader.split(" ")[1];

  try {
    // 3. Verify token using secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach user id to request
    req.userId = decoded.userId;

    // Debugging logs
    //   console.log("AUTH MIDDLEWARE HIT");
    //   console.log("Token:", token);

    // 5. Continue to route
    next();

  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};