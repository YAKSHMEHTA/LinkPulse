import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from 'cors';
import router from "../routes/auth.routes.js";
import cookieParser from "cookie-parser";
import { initRedis } from "../config/redis.js";
import linkRoutes from "../routes/link.routes.js";
import campaignRoutes from "../routes/campaign.routes.js";
import analyticsRoutes from "../routes/analytics.routes.js";
import adminRoutes from "../routes/admin.routes.js";
import redirectRoutes from "../routes/redirect.routes.js";
import { startClickFlusher } from "../services/clickBuffer.service.js";
import { errorHandler, notFound } from "../middleware/error.js";


dotenv.config();

const app = express();

const allowedOrigins = [
  'https://rawform-psi.vercel.app',
  'https://link-pulse-nine.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('trust proxy', 1);

app.use('/auth', router);
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
	startClickFlusher();
	app.listen(8080, () => {
		const red = initRedis();
		console.log('redis init result:', red ? 'client created' : 'disabled');
		console.log("server listening");
	});
});
