const { verify } = require("jsonwebtoken");

const validateToken = (req, res, next) => {
  const accessToken = req.header("accessToken");

  if (!accessToken) return res.json({ error: "User not logged in!" });

  try {
    //const validToken = verify(accessToken, "importantsecret");
    const validToken = verify(accessToken, "AYU3Gigiu33FYFuFkg786uiDY6164hguisdqsf264qsf68RgcjKj75hooLGF99");
    req.user = validToken;
    if (validToken) {
      return next();
    }
  } catch (err) {
    return res.json({ error: err });
  }
};

module.exports = { validateToken };
