import bcrypt from 'bcrypt';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';
import User from '../models/User.js';
import { generateToken } from '../services/authService.js';

export const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    logger.warn('Missing username, email, or password in register request');
    const error = new Error('All fields are required');
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    logger.warn(`User already exists: ${email} or ${username}`);
    const error = new Error('Username or email already exists');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, password: hashedPassword });

  const token = generateToken({ userId: user._id });

  logger.info(`User registered: ${username}`);
  res.status(201).json({
    success: true,
    data: { username: user.username, email: user.email, token },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    logger.warn('Missing email or password in login request');
    const error = new Error('All fields are required');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    logger.warn(`Invalid credentials for email: ${email}`);
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({ userId: user._id });

  const userData = {
    _id: user._id,
    username: user.username,
    email: user.email,
    profilePicture: user.profilePicture,
  };

  logger.info(`User logged in: ${user.username}`);
  res
    .cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 86400000,
    })
    .json({
      success: true,
      message: `Welcome back ${user.username}`,
      data: userData,
      token
    });
});

export const logout = asyncHandler(async (req, res) => {
  logger.info('User logged out');
  res
    .cookie('token', '', { httpOnly: true, sameSite: 'strict', maxAge: 0 })
    .json({ success: true, message: 'Logged out successfully' });
});