const { sign, refreshVerify } = require("./userService");
const jwt = require("jsonwebtoken");

const refresh = async (req, res) => {
  // console.log("refresh 실행", req.headers);

  if (req.headers.authorization && req.headers.refreshtoken) {
    const authToken = req.headers.authorization.split("Bearer ")[1];
    const refreshToken = req.headers.refreshtoken;

    // access token 디코딩하여 user의 정보를 가져옵니다.
    const decoded = jwt.decode(authToken);

    /* access token의 decoding 된 값에서
      유저의 email을 가져와 refresh token을 검증합니다. */
    const refreshResult = await refreshVerify(refreshToken, decoded.email);
    // console.log("refreshResult", refreshResult);

    //refresh token도 만료 된 경우 => 새로 로그인해야합니다.
    if (!refreshResult) {
      res.status(401).send({
        ok: false,
        message: "noRefreshToken",
      });
    } else {
      //access token이 만료되고, refresh token은 만료되지 않은 경우 => 새로운 access token을 발급
      const newAccessToken = sign(decoded);

      res.status(200).send({
        ok: true,
        data: {
          accessToken: newAccessToken,
          refreshToken: refreshToken,
          decoded,
        },
      });
    }
  }
};

module.exports = { refresh };
