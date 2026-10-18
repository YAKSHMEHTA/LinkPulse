import jwt from "jsonwebtoken";
import cookies from "cookie-parser";
import dotenv from "dotenv";
import user from "../models/usermodel.js";
import cookieParser from "cookie-parser";
import usermodel from "../models/usermodel.js";

dotenv.config();

const cookiesOption = {
	httpOnly: true,
	secure: process.env.isProd,
	sameSite: process.env.isProd ? "none" : "lax",
	path: "/",
};

export const tokenGenrator = async (user) => {
	return jwt.sign({ id: user.id, role: user.role }, process.env.access_token_secret, { expiresIn: "7d" });
};

export const setCookies = async (res, user) => {
	res.cookie("accessToken", tokenGenrator(user), { ...cookiesOption, maxAge: 7 * 24 * 3600 * 1000 });
};

export const verifyUser = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken;
    if (!accessToken) {
      return res.status(401).json({ msg: "user not logged in" });
    }

    const decoded = jwt.verify(accessToken, process.env.access_token_secret);
    const user = await usermodel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ msg: "user not found" });
    }

    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({
      success: false,
      message: "Access token expired or invalid",
    });
  }
};
