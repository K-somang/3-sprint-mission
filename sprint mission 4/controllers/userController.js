import bcrypt from 'bcrypt';
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

const updateUserInfo = async (req, res, next) => {
  auth.UserInfoAuth
  try {
    const { id } = req.user;
    const { email, nickname } = req.body;
    const data = { email, nickname };

    const updatedUserInfo = await prisma.user.update({
      where: { id: Number(id) },
      data,
      select: {
        email: true,
        nickname: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(updatedUserInfo)
  } catch (error) {
    console.log("유저 정보 수정 오류", error);
    res.status(500).json({ error: '서버에 오류가 발생했습니다.' });
  }
}

async function hashingPassword(password) {
  return bcrypt.hash(password, 10);
}

const updatePasswordInfo = async (req, res, next) => {
  auth.UserInfoAuth
  try {
    const { id } = req.user;
    const { password } = req.body;
    const hashedPassword = await hashingPassword(password);

    const updatePasswordInfo = await prisma.user.update({
      where: { id: Number(id) },
      data: { password: hashedPassword },
      select: {
        password: true,
      }
    });

    res.json({ message: "유저 비밀번호 변경 완료" })
  } catch (error) {
    console.log("유저 비밀번호 변경 오류", error);
    res.status(500).json({ error: '서버에 오류가 발생했습니다.' });
  }
}

const ProductInfo = async (req, res, next) => {
  auth.UserInfoAuth
  try {
    const { id } = req.user;
    const user = await registerRepository.getProductInfo(id);
    if (!user) return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });

  }

}

export default {
  UserInfo,
  updateUserInfo,
  updatePasswordInfo,
  ProductInfo,
};