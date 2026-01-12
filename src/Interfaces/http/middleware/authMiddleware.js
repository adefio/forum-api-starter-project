const authMiddleware = (container) => async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Cek keberadaan header dan format Bearer
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      status: 'fail', 
      message: 'Missing or invalid authentication format' 
    });
  }

  const token = authHeader.split(' ')[1];
  const tokenManager = container.getInstance('AuthenticationTokenManager');

  try {
    /**
     * 2. Sangat disarankan menggunakan method verifikasi (jwt.verify)
     * bukan sekadar decode, untuk memastikan token asli & belum expired.
     */
    const { id } = await tokenManager.verifyAccessToken(token); 
    
    // Simpan ke req.auth agar bisa diakses di handler (req.auth.id)
    req.auth = { id }; 
    next();
  } catch (error) {
    // 3. Jika error karena token salah/expired, kirim 401
    // Jika error karena sistem, bisa gunakan next(error)
    return res.status(401).json({ 
      status: 'fail', 
      message: 'Invalid or expired token' 
    });
  }
};

module.exports = authMiddleware;