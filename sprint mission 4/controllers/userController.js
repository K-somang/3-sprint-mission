import auth from "../middlewares/auth.js";
import registerRepository from "../repositories/registerRepository.js";

const UserInfo = async (req, res, next) => {
  auth.UserInfoAuth
  try {
    const { id } = req.user;
    const user = await registerRepository.getUser(id);

    if (!user) return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
    res.status(200).json(user);

  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });

  }
}

export default {
  UserInfo,

};