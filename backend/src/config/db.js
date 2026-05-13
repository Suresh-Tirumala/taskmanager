import { Sequelize } from 'sequelize';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  dialectModule: Database,
  storage: './database.sqlite',
  logging: false
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite database connected successfully');
    await sequelize.sync();
    console.log('Database synchronized');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;
export { sequelize };