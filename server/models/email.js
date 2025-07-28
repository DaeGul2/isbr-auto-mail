const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Email = sequelize.define('Email', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    sender: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    recipient: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email_html: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('대기', '수락', '거절'),
      defaultValue: '대기',
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    responded_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'projects',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
  }, {
    tableName: 'emails',
    timestamps: false,
  });

  return Email;
};
