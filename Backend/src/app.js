import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from 'cors';
import router from "../routes/auth.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

cors({
	origin: '*',
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
