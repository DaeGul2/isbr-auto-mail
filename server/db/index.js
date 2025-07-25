const sequelize = require('../config/sequelize');

const Email = require('../models/email')(sequelize);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB 연결 성공');

    // ❗ 개발 중엔 sync({ alter: true }) 권장
    await sequelize.sync(); // 또는 sync({ alter: true })
    console.log('✅ 모델 동기화 완료');
  } catch (error) {
    console.error('❌ DB 연결 실패:', error);
  }
};

module.exports = { sequelize, connectDB, Email };
