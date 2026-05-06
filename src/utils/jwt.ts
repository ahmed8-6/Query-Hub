import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const createTokens = (payload: {
  id: string;
  username: string;
  isAdmin: boolean;
}) => {
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_ACCESS_TOKEN_SECRET as string,
    { expiresIn: "15m" },
  );
  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_TOKEN_SECRET as string,
    { expiresIn: "7d" },
  );

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET as string) as {
      id: string;
      username: string;
      isAdmin: boolean;
    };
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_REFRESH_TOKEN_SECRET as string,
    ) as {
      id: string;
      username: string;
      isAdmin: boolean;
    };
  } catch (error) {
    return null;
  }
};
