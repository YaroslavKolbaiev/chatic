import jwt from 'jsonwebtoken';

function generateAccessToken(user) {
  return jwt.sign({sub: user.id}, process.env.JWT_ACCESS_SECRET, {expiresIn: '3h'})
}

function validateAccessToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET)
  } catch (error) {
    return null;
  }
}

export const jwtService = {
  generateAccessToken,
  validateAccessToken,
}