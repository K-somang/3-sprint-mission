import { RequestHandler } from 'express'
import authService from '../services/authService.js'

const createUser: RequestHandler = async (req, res, next) => {
  try {
    const user = await authService.createUser(req.body);
    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

const login: RequestHandler = async (req, res, next) => {
  try {
    const user = await authService.login(req.body);
    const accessToken = await authService.createToken(user);
    return res.json({ accessToken });
  } catch (error) {
    next(error);
  }
};

export default { createUser, login };

