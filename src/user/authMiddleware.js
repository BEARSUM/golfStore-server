const { verify } = require("jsonwebtoken");
require("dotenv").config();
const secretKey = process.env.SECRET_KEY;

const adminOnlyMiddleware = async (req, res, next) => {
  if (req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ error: "접근 권한이 없습니다." });
  }
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split("Bearer ")[1];
    if (!token) {
      return res.status(401).json({ error: "noToken" });
    }

    const user = verify(token, secretKey);

    if (!user) {
      // console.log("middleware - noUser");

      return res.status(401).json({ error: "noUser" });
    }

    req.user = user;

    // 자기 자신인지 확인
    const userId = req.params.userId;
    if (userId === user.id) {
      req.user.isSelf = true;
    } else {
      req.user.isSelf = false;
    }

    next();
  } catch (error) {
    // console.log("middleware - Access token expired");

    res.status(401).json({ error: "expired" });
  }
};

module.exports = { adminOnlyMiddleware, authMiddleware };
