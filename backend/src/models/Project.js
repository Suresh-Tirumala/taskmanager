import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  members: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'projects',
  timestamps: true
});

export default Project;
