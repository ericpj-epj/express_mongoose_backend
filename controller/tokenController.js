import jwt from "jsonwebtoken";

export const issueToken = async (req, res) => {
  const { supplierId, scope } = req.body;

  const accessToken = jwt.sign(
    {
      iss: "supplier-api",
      sub: "supplier",
      supplierId,
      scope,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: process.env.JWT_EXPIRATION_HOURS },
  );

  const refreshToken = jwt.sign(
    { supplierId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES },
  );

  res.json({
    accessToken,
    refreshToken,
  });
};
