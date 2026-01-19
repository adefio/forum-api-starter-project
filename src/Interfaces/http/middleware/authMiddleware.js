const authMiddleware = (container) => async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Cek keberadaan header dan format Bearer
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      status: 'fail', 
      // UBAH PESAN INI: Dari 'Missing or invalid authentication format' menjadi 'Missing authentication'
      message: 'Missing authentication' 
    });
  }

  const token = authHeader.split(' ')[1];
  const tokenManager = container.getInstance('AuthenticationTokenManager');

  try {
    const { id } = await tokenManager.verifyAccessToken(token); 
    req.auth = { id }; 
    next();
  } catch (error) {
    // 2. Jika token salah/expired juga harus 'Missing authentication' agar aman untuk Postman
    return res.status(401).json({ 
      status: 'fail', 
      message: 'Missing authentication' 
    });
  }
};

module.exports = authMiddleware;