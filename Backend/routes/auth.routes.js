import { Router } from "express";
import { validate } from "../middleware/validate.js";
import bcrypt from 'bcryptjs';
import User from "../models/usermodel.js";
import { setCookies } from "../middleware/auth.js";
import z from 'zod'

const router = Router();

const registerSchema = z.object({
    username: z.string().trim().max(60),
    email:z.string().max(50).trim().toLowerCase().pipe(z.email()),
    password: z.string().trim().min(8).max(60),
})

router.post('/register',validate(registerSchema),async(req,res)=>{
    const {username,email,password} = req.valid.body;
    const findUser = await User.exists({email});
    if(findUser){
        return res.status(409).json({msg:'user already exists'});
    }
    const user = await User.create({username,email,passwordHashed:await bcrypt.hash(password,10)});
    console.log(user);
    await user.save();
    console.log(req.valid.body);
    return res.status(200).json({msg:'user created'});
})

const loginSchema = z.object({
    username:z.string().max(70),
    password:z.string().min(8).max(70),
})

router.post('/login',validate(loginSchema),async(req,res)=>{
    const {username,password} = req.body;

    const user = await User.findOne({username});
    if(!user){
        return res.status(401).json({msg:'user not found'});
    }
    console.log(user)
    const verifyPassword = await bcrypt.compare(password,user.passwordHashed);
    if(!verifyPassword){
        return res.status(401).json({msg:'wrong username or password'});
    }

    setCookies(res,user);
    return res.status(200).json({msg:'user loged in'})


})

export default router

