import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const ProjectMember = sequelize.define('ProjectMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'member'
  },
  addedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'project_members',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['projectId', 'userId']
    }
  ]
});

export default ProjectMember;