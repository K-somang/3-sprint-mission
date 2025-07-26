import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import registerRepository from '../repositories/registerRepository.js';

async function hashingPassword(password) {
  return bcrypt.hash(password, 10);
}

async function createUser(user) {
  const existedUser = await registerRepository.findByEmail(user.email);

  if (existedUser) {
    const error = new Error('User already exists');
    error.code = 422;
    error.data = { email: user.email };
    throw error;
  }

  const hashedPassword = await hashingPassword(user.password);
  const createUser = await registerRepository.save({ ...user, password: hashedPassword });
  return filterSensitiveUserData(createUser);
}

function filterSensitiveUserData(user) {
  return user;
}

async function login({ email, password }) {
  const user = await registerRepository.findByEmail(email);
  if (!user) {
    const error = new Error('Unauthorized');
    error.code = 401;
    throw error;
  }
  await verifyPassword(password, user.password);
  return filterSensitiveUserData(user);
}

async function verifyPassword(inputPassword, password) {
  const isMatch = await bcrypt.compare(inputPassword, password);
  if (!isMatch) {
    const error = new Error('Unauthorized');
    error.code = 401;
    throw error;
  }
}

async function createToken(user) {
  const payload = {
    id: user.id,
    nickname: user.nickname,
    email: user.email,
    password: user.password,
  };
  const options = { expiresIn: '1h' };
  return jwt.sign(payload, process.env.JWT_SECRET, options);
}

export default {
  createUser,
  login,
  createToken,
};