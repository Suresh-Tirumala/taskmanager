import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const PRIORITY_ENUM = ['low', 'medium', 'high'];
const STATUS_ENUM = ['todo', 'in_progress', 'completed'];

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  assignedTo: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM(...PRIORITY_ENUM),
    defaultValue: 'medium',
    validate: {
      isIn: [PRIORITY_ENUM]
    }
  },
  status: {
    type: DataTypes.ENUM(...STATUS_ENUM),
    defaultValue: 'todo',
    validate: {
      isIn: [STATUS_ENUM]
    }
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  project: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'tasks',
  timestamps: true
});

export default Task;
