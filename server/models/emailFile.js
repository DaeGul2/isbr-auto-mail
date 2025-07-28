const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EmailFile = sequelize.define('EmailFile', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    emailId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'emails',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    originalName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    size: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    localPath: {
      type: DataTypes.STRING(512),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'email_files',
    updatedAt: false,
  });

  return EmailFile;
};
