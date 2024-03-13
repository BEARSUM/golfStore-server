const User = require("./userModel");
const userService = require("./userService");

//회원가입
const signUp = async (req, res) => {
  try {
    const userData = req.body;
    await userService.signUp(userData);

    res.json({ message: "회원가입이 완료되었습니다." });
  } catch (error) {
    console.error(error);

    if (error.details) {
      const errorMessages = error.details.map((err) => err.message);
      return res.status(400).json({ errors: errorMessages });
    }

    if (typeof error === "string") {
      return res.status(400).json({ errors: error });
    }

    res.status(500).json({ error: "회원가입 중 오류가 발생했습니다." });
  }
};

//로그인
const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { accessToken, refreshToken, targetUser } = await userService.signIn(
      email,
      password
    );

    //refresh token을 DB에 저장합니다.
    const user = await User.findOne({ email });
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      accessToken,
      refreshToken,
      targetUser,
    });
  } catch (error) {
    next(error);
  }
};

//특정 사용자 정보 조회
const getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userService.getUserById(userId);
    const userDataToView = {
      email: user.email,
      password: user.password,
      name: user.name,
      address: user.address,
      birthdate: user.birthdate,
      phoneNumber: user.phoneNumber,
    };

    //res.json({ email: user.email, name: user.name });
    res.json(userDataToView);
  } catch (error) {
    next(error);
  }
};

//모든 사용자 정보 조회
const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();

    res.json(users);
  } catch (error) {
    next(error);
  }
};

//로그인/아웃 상태 확인
const signCheck = async (req, res) => {
  if (req.user.isAdmin) {
    res.json({ user: req.user });
  } else {
    res.json({ user: { email: req.user.email } });
  }
};

//회원정보 수정
const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const userData = req.body;

    const user = await userService.getUserById(userId);
    if (!user) {
      //return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
      next("사용자를 찾을 수 없습니다.");
      return;
    }

    // if (!req.userId.equals(userId)) {
    //   return res.status(401).json({ error: "권한이 없습니다." });
    // }

    const updatedUser = await userService.updateUser(userId, userData);

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    // res.json(error);
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const userData = req.body;

    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    const updatedUser = await userService.changePassword(userId, userData);

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.json(error);
  }
};

//회원 탈퇴
const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const deletedUser = await userService.deleteUser(userId);

    res.json({ message: "회원이 삭제되었습니다." });
  } catch (error) {
    next(error);
  }
};

const getUserByToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      next("token이 요청되지 않음.");
    }
    const user = await userService.getUserByToken(token);
    res.json(user);
  } catch (error) {
    // console.log("userController getUserByToken error", error);
    next(error);
  }
};

// 내정보 보기 -> 내 Token -> 해당 토큰의 유저 정보를 출력
// 모든 회원 조회는 (-> 내 Token -> 해당 토큰이 관리자인지 확인,) -> 모든 유저의 정보 출력
// 특정 회원 보기 -> 내 Token -> 해당 토큰이 관리자라면 -> 해당 유저 정보 다 보여주기
// 특정 회원 보기 -> 내 Token -> 해당 토큰이 관리자가 아니라면 -> 해당 유저 정보 중 공개 정보만 보여주기

module.exports = {
  getAllUsers,
  getUser,
  signUp,
  signIn,
  signCheck,
  updateUser,
  deleteUser,
  changePassword,
  getUserByToken,
};
