const getCookieConfig = () => ({
  httpOnly: true,
  secure: false, // Set to true in production
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: '/'
});

module.exports = { getCookieConfig };
