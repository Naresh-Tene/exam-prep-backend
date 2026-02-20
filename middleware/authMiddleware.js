const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Keep a consistent shape for controllers (expects req.user._id)
      req.user = { _id: decoded.id };
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized" });
    }

  } else {
    return res.status(401).json({ message: "No token provided" });
  }
};

module.exports = protect;