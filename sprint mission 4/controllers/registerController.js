import registerService from '../services/registerService.js'

const createUser = async (req, res, next) => {
  try {
    const user = await registerService.createUser(req.body);
    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const user = await registerService.login(req.body);
    const accessToken = await registerService.createToken(user);
    return res.json({ accessToken });
  } catch (error) {
    next(error);
  }
};

export default { createUser, login };

