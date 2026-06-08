const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;

  // 1. Check if token exists
  if (!authHeader) {
    return res.status(401).json({ message: "No token, access denied" });
  }

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ message: "Invalid token format" });
  }

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
