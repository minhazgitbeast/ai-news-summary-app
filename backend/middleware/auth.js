import jwt from "jsonwebtoken";

const config = {
  JWT_SECRET:
    process.env.JWT_SECRET ||
    "8f9a8f799dad4d3bce56f00c2bd21a147d534871c6cdb94ef4ae4e268a118db0",
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default verifyToken;
