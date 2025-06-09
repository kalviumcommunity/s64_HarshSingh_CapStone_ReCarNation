const getCookieConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction, // Must be true in production
    sameSite: none, // 'none' for cross-site, 'lax' for local dev
    maxAge: 24 * 60 * 60 * 1000,
    path: '/'
  };
};

module.exports = { getCookieConfig };
