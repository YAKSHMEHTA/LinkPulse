import {Router} from 'express';
import z from 'zod';
import Link from '../models/link';
import bcrypt from 'bcryptjs';
import Link from '../models/link';
import User from '../models/usermodel';
import { verifyUser } from '../middleware/auth';

