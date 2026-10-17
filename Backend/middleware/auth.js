import jwt from "jsonwebtoken";
import cookies from "cookie-parser";
import dotenv from "dotenv";
import user from "../models/usermodel.js";

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
	res.cookie("accessToken", tokenGenrator(user), { ...cookiesOption,maxAge: 7 * 24 * 3600 * 1000});
};

