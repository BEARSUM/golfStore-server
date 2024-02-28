require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
app.set("port", process.env.PORT || 8080);
app.use("/public", express.static("public"));
app.use(express.json());

// MongoDB와의 연결 설정
mongoose
  .connect(`${process.env.MONGODB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Successfully connected to mongodb"))
  .catch((e) => console.error(e));

// 모든 도메인에서의 API 요청을 허용하도록 설정
app.use(
  cors({
    origin: "*",
  })
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// user 라우터 등록
const userRouter = require("./src/user/userRouter");
app.use("/users", userRouter);

// product 라우터 등록
const productRouter = require("./src/product/productRouter");
app.use("/products", productRouter);

// category 라우터 등록
const categoryRouter = require("./src/category/categoryRouter");
app.use("/category", categoryRouter);

// order 라우터 등록
const orderRouter = require("./src/order/orderRouter");
app.use("/order", orderRouter);

// 에러처리 미들웨어
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err }); // 에러 객체로 응답
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기 중");
});
