const sequelize = require('../config/sequelize');

const Email = require('../models/email')(sequelize);
const Project = require('../models/project')(sequelize);
const EmailFile = require('../models/emailFile')(sequelize);

// 관계 설정
Project.hasMany(Email, { foreignKey: 'projectId', as: 'emails' });
Email.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

Email.hasMany(EmailFile, { foreignKey: 'emailId', as: 'files' });
EmailFile.belongsTo(Email, { foreignKey: 'emailId', as: 'email' });

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB 연결 성공');
    await sequelize.sync({ alter: true });
    console.log('✅ 모델 동기화 완료');
  } catch (error) {
    console.error('❌ DB 연결 실패:', error);
  }
};

module.exports = {
  sequelize,
  connectDB,
  Email,
  Project,
  EmailFile,
};
