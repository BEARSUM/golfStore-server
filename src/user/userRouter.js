const express = require("express");
const refresh = require("./refresh");
const userRouter = express.Router();
const userController = require("./userController");
const { authMiddleware, adminOnlyMiddleware } = require("./authMiddleware");

// 특정 회원 정보 조회
userRouter.get(
  "/:userId",
  authMiddleware,
  adminOnlyMiddleware,
  userController.getUser
);

// 회원가입
userRouter.post("/sign-up", userController.signUp);

// 로그인
userRouter.post("/sign-in", userController.signIn);

//access token 갱신
userRouter.post("/refresh", refresh.refresh);

// 로그인/아웃 상태 확인
//userRouter.post("/sign-check", authMiddleware, userController.signCheck);

// 전체 회원 정보 조회
userRouter.get(
  "/",
  authMiddleware,
  adminOnlyMiddleware,
  userController.getAllUsers
);

//회원 정보 수정(비밀번호 제외)
userRouter.put("/:userId", userController.updateUser);

// 회원 정보 수정(비밀번호)
userRouter.put("/changePassword/:userId", userController.changePassword);

//회원 탈퇴
userRouter.delete("/:userId", userController.deleteUser);

//토큰으로 회원조회
userRouter.get("/token/:token", authMiddleware, userController.getUserByToken);

// userRouter.get("/list", userController.getUserList);
// userRouter.post("/sign-out", userController.signOut);

module.exports = userRouter;
