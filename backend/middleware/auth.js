import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  const jwtSecret = process.env.ADMIN_JWT_SECRET;

  if (!jwtSecret) {
    console.error('[Auth Middleware] ADMIN_JWT_SECRET is not set in environment variables.');
    return res.status(500).json({ message: 'Server misconfiguration.' });
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No authorization header provided.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
    req.user = decoded;
    next();
  } catch (error) {
    // Do not expose internal JWT error messages to the client
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

export default auth;
