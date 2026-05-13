import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.MYSQL_PUBLIC_URL;
const dbHost = process.env.MYSQLHOST || process.env.DB_HOST || 'localhost';
const dbPort = process.env.MYSQLPORT || process.env.DB_PORT || 3306;
const dbName = process.env.MYSQLDATABASE || process.env.DB_NAME || 'taskmanager';
const dbUser = process.env.MYSQLUSER || process.env.DB_USER || 'root';

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: 'mysql',
      logging: false
    })
  : new Sequelize({
      dialect: 'mysql',
      host: dbHost,
      port: dbPort,
      database: dbName,
      username: dbUser,
      password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
      logging: false
    });

const connectDB = async () => {
  try {
    console.log(
      databaseUrl
        ? 'Connecting to MySQL using DATABASE_URL/MYSQL_URL'
        : `Connecting to MySQL at ${dbHost}:${dbPort}/${dbName} as ${dbUser}`
    );
    await sequelize.authenticate();
    console.log('MySQL database connected successfully');
    await sequelize.sync();
    console.log('Database synchronized');
  } catch (error) {
    console.error('Database connection error:', {
      name: error.name,
      message: error.message,
      code: error.parent?.code,
      errno: error.parent?.errno,
      sqlState: error.parent?.sqlState,
      sqlMessage: error.parent?.sqlMessage
    });
    process.exit(1);
  }
};

export default connectDB;
export { sequelize };
