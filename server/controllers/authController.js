const { generateToken } = require('../config/jwt');

const login = (req, res) => {
  const { code } = req.body;
  const superSecret = process.env.SUPER_SECRET;

  if (!code || code !== superSecret) {
    return res.status(401).json({ message: '잘못된 코드입니다.' });
  }

  const token = generateToken({ role: 'employee' });
  return res.json({ token });
};

module.exports = { login };
