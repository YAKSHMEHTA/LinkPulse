import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from 'cors';
import router from "../routes/auth.routes.js";
import cookieParser from "cookie-parser";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.set('trust proxy', 1);

cors({
	origin: 'http://localhost:3000',
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	allowedHeaders: ['Content-Type', 'Authorization'],
  });



app.use('/auth',router)

app.get("/health", (req, res) => {
	res.json({ msg: "Server healthy" });
});

mongoose.connect(process.env.MONGO_DB_URI).then(() => {
	console.log("database connected");
	app.listen(8080, () => {
		console.log("server listening");
	});
});
