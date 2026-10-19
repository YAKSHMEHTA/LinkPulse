import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from 'cors';
import router from "../routes/auth.routes.js";
import cookieParser from "cookie-parser";
import { initRedis } from "../config/redis.js";
import authRoutes from "../routes/auth.routes.js";
import linkRoutes from "../routes/link.routes.js";
import campaignRoutes from "../routes/campaign.routes.js";
import analyticsRoutes from "../routes/analytics.routes.js";
import adminRoutes from "../routes/admin.routes.js";
import redirectRoutes from "../routes/redirect.routes.js";
import { errorHandler, notFound } from "../middleware/error.js";


dotenv.config();

const app = express();


const allowdOrigin = ["https://rawform-psi.vercel.app","http://localhost:5173"];

app.use(
  cors({
    origin: allowdOrigin,
    credentials: true,
  }),
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('trust proxy', 1);

app.use('/auth',router)


app.use('/auth', authRoutes);
app.use('/links', linkRoutes);
app.use('/campaigns', campaignRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/admin', adminRoutes);
app.use('/api', notFound); 

app.use(redirectRoutes); 

app.use(errorHandler);


app.get("/health", (req, res) => {
	res.json({ msg: "Server healthy" });
});

mongoose.connect(process.env.MONGO_DB_URI).then(() => {
	console.log("database connected");
	app.listen(8080, () => {
		const red = initRedis();
		console.log('redis init result:', red ? 'client created' : 'disabled');
		console.log("server listening");
	});
});
