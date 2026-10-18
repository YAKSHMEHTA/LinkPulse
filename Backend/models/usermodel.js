import mongoose from "mongoose";
import { model, Schema } from "mongoose";

const userSchema = new Schema(
	{
		username: { type: String, required: true, trim: true, maxlength: 60 },
		email: { type: String, required: true, maxlength: 60 },
		passwordHashed: { type: String, required: true, maxlength: 60 },
		role: { type: String, enum: ["user", "admin"], default: "user" },
	},
	{ timestamp: true },
);

export default new model('User',userSchema);