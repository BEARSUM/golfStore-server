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

const whitelist = ["http://127.0.0.1:5502"]; // 클라이언트 주소
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // 요청의 인증 정보를 포함합니다.
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

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
