const express = require("express");
const admin = require("firebase-admin");

const router = express.Router();

router.post("/verify", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify token
    const decodedToken = await admin.auth().verifyIdToken(token);

    if (decodedToken.admin === true) {
      res.json({ message: "Admin verified successfully", uid: decodedToken.uid });
    } else {
      res.status(403).json({ message: "Admins only" });
    }
  } catch (err) {
    console.error("Error verifying admin token:", err.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

module.exports = router;
