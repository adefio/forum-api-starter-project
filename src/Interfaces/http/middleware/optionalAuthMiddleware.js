const optionalAuthMiddleware = (container) => async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  const tokenManager = container.getInstance('AuthenticationTokenManager');

  try {
    const { id } = await tokenManager.verifyAccessToken(token);
    req.auth = { id };
  } catch (error) {
    // Token tidak valid/expired — tetap lanjut tanpa autentikasi
  }

  return next();
};

module.exports = optionalAuthMiddleware;
