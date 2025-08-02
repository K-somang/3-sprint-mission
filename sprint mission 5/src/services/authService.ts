import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authRepository from '../repositories/authRepository.js';
import { CustomError } from '../middlewares/errorHandler.js';

async function hashingPassword(password: string | Buffer<ArrayBufferLike>) {
  return bcrypt.hash(password, 10);
}

async function createUser(user: { email: string; password: string; nickname: string; }) {
  const existedUser = await authRepository.findByEmail(user.email);

  if (existedUser) {
    throw new CustomError('User already exists', 422, { email: user.email });
  }

  const hashedPassword = await hashingPassword(user.password);
  const createUser = await authRepository.save({ ...user, password: hashedPassword });
  return filterSensitiveUserData(createUser);
}

function filterSensitiveUserData(user: { [key: string]: any }) {
  return user;
}

async function login({ email, password }: { email: string; password: string }) {
  const user = await authRepository.findByEmail(email);
  if (!user) {
    throw new CustomError('Unauthorized', 401);
  }
  await verifyPassword(password, user.password);
  return filterSensitiveUserData(user);
}

async function verifyPassword(inputPassword: string | Buffer<ArrayBufferLike>, password: string) {
  const isMatch = await bcrypt.compare(inputPassword, password);
  if (!isMatch) {
    throw new CustomError('Unauthorized', 401);
  }
}

async function createToken(user: { id: number; nickname: string; email: string; password: string; }) {
  const payload = {
    id: user.id,
    nickname: user.nickname,
    email: user.email,
    password: user.password,
  };
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  const options: jwt.SignOptions = {
    expiresIn: '1h',
  };
  const token = jwt.sign(payload, secret, options);
  return token;
}

export default {
  createUser,
  login,
  createToken,
};