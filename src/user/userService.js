const User = require("./userModel");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
require("dotenv").config();

const jwt = require("jsonwebtoken");

const secretKey = process.env.SECRET_KEY;
const {
  signUpValidator,
  updateUserValidator,
  changePasswordValidator,
} = require("./userValidator");

// 회원 가입,
const signUp = async (userData) => {
  const { value, error } = signUpValidator.validate(userData);

  if (error) {
    throw error;
  }

  const existUser = await User.findOne({ email: value.email });

  if (existUser) {
    throw "이미 존재하는 이메일입니다.";
  }

  const hashedPassword = await bcrypt.hash(value.password, 10);
  const newUser = new User(value);
  newUser.password = hashedPassword;
  await newUser.save();
  return { email: newUser };
};

//Access Token 발급
const sign = (user) => {
  const payload = {
    email: user.email,
  };
  return jwt.sign(payload, secretKey, {
    algorithm: "HS256",
    expiresIn: "30m",
  });
};

//Refresh Token 발급
const refresh = () => {
  return jwt.sign({}, secretKey, {
    algorithm: "HS256",
    expiresIn: "1d",
  });
};

// 로그인
const signIn = async (email, password) => {
  const targetUser = await User.findOne({ email }).exec();
  if (!targetUser) {
    throw new Error("등록된 사용자가 없습니다.");
  }

  const passwordMatch = await bcrypt.compare(password, targetUser.password);
  if (!passwordMatch) {
    throw new Error("로그인에 실패하였습니다.");
  }

  const accessToken = sign(targetUser);
  const refreshToken = refresh();

  return { accessToken, refreshToken, targetUser };
};

//토큰 검증 -> 유효시 유저 이메일 객체 반환
const verify = (token) => {
  let user = null;
  try {
    user = jwt.verify(token, secretKey);
    return { ok: true, ...user };
  } catch (err) {
    return { ok: false, message: "jwt expired" };
  }
};

//토큰 검증 -> 유효시 유저 이메일 객체 반환
const refreshVerify = async (token, email) => {
  try {
    const user = await User.findOne({ email });
    // console.log("refreshVerifyDB", user);
    if (!user) return false;

    const refreshToken = user.refreshToken;
    // console.log("DB토큰비교", refreshToken, token);
    if (token === refreshToken) {
      try {
        jwt.verify(token, secretKey);
        return true;
      } catch (err) {
        console.error("Token verification failed:", err);
        return false;
      }
    } else return false;
  } catch (err) {
    console.error("Error verifying refresh token:", err);
    return false;
  }
};
// 토큰으로 유저 정보 조회
const getUserByToken = async (token) => {
  const tokenInfo = jwt.verify(token, secretKey);
  const email = tokenInfo.email;
  const user = await User.findOne({ email });

  return user;
};

// 아이디로 유저 정보 조회
const getUserById = async (userId) => {
  return await User.findById(userId);
};

// 전체 회원 정보 조회
const getAllUsers = async () => {
  const users = await User.find({});
  return users;
};

const changePassword = async (userId, userData) => {
  const { value: cleanUserData, error } =
    changePasswordValidator.validate(userData);

  if (error) {
    throw error;
  }

  try {
    const willUpdateUser = await User.findById(userId);

    const passwordMatch = await bcrypt.compare(
      cleanUserData.previousPassword,
      willUpdateUser.password
    );

    if (!passwordMatch) {
      throw "기존 비밀번호가 올바르지 않습니다.";
      return;
    }

    willUpdateUser.password = await bcrypt.hash(cleanUserData.password, 10);
    willUpdateUser.save();

    return willUpdateUser;
  } catch (error) {
    throw error;
  }
};

// 회원 정보 수정
const updateUser = async (userId, userData) => {
  const { value: cleanUserData, error } =
    updateUserValidator.validate(userData);

  if (error) {
    throw error;
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, cleanUserData, {
      new: true,
    });

    return updatedUser;
  } catch (error) {
    throw error;
  }
};

// 회원 탈퇴
const deleteUser = async (userId) => {
  await User.findByIdAndDelete(userId);
};

module.exports = {
  sign,
  signUp,
  verify,
  refresh,
  refreshVerify,
  signIn,
  getUserById,
  getUserByToken,
  getAllUsers,
  updateUser,
  deleteUser,
  changePassword,
};
